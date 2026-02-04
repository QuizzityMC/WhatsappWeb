import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import db from '../config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class WhatsAppService {
  constructor(wsServer) {
    this.sock = null;
    this.qrCode = null;
    this.isConnected = false;
    this.wsServer = wsServer;
    this.sessionPath = process.env.SESSION_PATH || join(__dirname, '../../data/auth_info');
    
    if (!existsSync(this.sessionPath)) {
      mkdirSync(this.sessionPath, { recursive: true });
    }
  }

  async initialize() {
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      logger: pino({ level: 'silent' }),
      browser: ['WhatsApp Web', 'Chrome', '110.0.0']
    });

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCode = qr;
        this.broadcastToClients({ type: 'qr', data: qr });
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          await this.initialize();
        } else {
          this.isConnected = false;
          this.broadcastToClients({ type: 'disconnected' });
        }
      } else if (connection === 'open') {
        this.isConnected = true;
        this.qrCode = null;
        this.broadcastToClients({ type: 'connected' });
        console.log('WhatsApp connection established');
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
      for (const message of messages) {
        await this.handleIncomingMessage(message);
      }
    });

    this.sock.ev.on('chats.set', async ({ chats }) => {
      for (const chat of chats) {
        this.saveChat(chat);
      }
    });

    this.sock.ev.on('chats.update', async (chats) => {
      for (const chat of chats) {
        this.updateChat(chat);
      }
    });
  }

  async handleIncomingMessage(message) {
    try {
      const chatId = message.key.remoteJid;
      const messageId = message.key.id;
      const fromMe = message.key.fromMe;
      const messageText = message.message?.conversation || 
                         message.message?.extendedTextMessage?.text || 
                         '';
      const timestamp = message.messageTimestamp;

      // Save message to database
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO messages (id, chat_id, from_me, message_text, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(messageId, chatId, fromMe ? 1 : 0, messageText, timestamp);

      // Update chat
      const updateChat = db.prepare(`
        UPDATE chats SET last_message = ?, last_message_time = ?, unread_count = unread_count + ?
        WHERE id = ?
      `);
      updateChat.run(messageText, timestamp, fromMe ? 0 : 1, chatId);

      // Broadcast to connected clients
      this.broadcastToClients({
        type: 'new_message',
        data: {
          id: messageId,
          chatId,
          fromMe,
          text: messageText,
          timestamp
        }
      });
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  saveChat(chat) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO chats (id, name, is_group, unread_count)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(
        chat.id,
        chat.name || chat.id,
        chat.id.endsWith('@g.us') ? 1 : 0,
        chat.unreadCount || 0
      );
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }

  updateChat(chat) {
    try {
      const updates = [];
      const values = [];

      if (chat.name) {
        updates.push('name = ?');
        values.push(chat.name);
      }
      if (chat.unreadCount !== undefined) {
        updates.push('unread_count = ?');
        values.push(chat.unreadCount);
      }

      if (updates.length > 0) {
        values.push(chat.id);
        const stmt = db.prepare(`UPDATE chats SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...values);
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  }

  broadcastToClients(data) {
    if (this.wsServer) {
      this.wsServer.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(data));
        }
      });
    }
  }

  async getChats() {
    try {
      const stmt = db.prepare(`
        SELECT * FROM chats 
        ORDER BY last_message_time DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  async getChatMessages(chatId, limit = 50, offset = 0) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM messages 
        WHERE chat_id = ?
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);
      return stmt.all(chatId, limit, offset);
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async sendMessage(chatId, text) {
    try {
      if (!this.isConnected || !this.sock) {
        throw new Error('WhatsApp not connected');
      }

      const message = await this.sock.sendMessage(chatId, { text });
      
      // Save sent message
      const stmt = db.prepare(`
        INSERT INTO messages (id, chat_id, from_me, message_text, timestamp)
        VALUES (?, ?, 1, ?, ?)
      `);
      stmt.run(message.key.id, chatId, text, Math.floor(Date.now() / 1000));

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMediaMessage(chatId, mediaBuffer, mimetype, caption) {
    try {
      if (!this.isConnected || !this.sock) {
        throw new Error('WhatsApp not connected');
      }

      let messageContent = {};
      
      if (mimetype.startsWith('image/')) {
        messageContent.image = mediaBuffer;
      } else if (mimetype.startsWith('video/')) {
        messageContent.video = mediaBuffer;
      } else if (mimetype.startsWith('audio/')) {
        messageContent.audio = mediaBuffer;
      } else {
        messageContent.document = mediaBuffer;
        messageContent.mimetype = mimetype;
      }

      if (caption) {
        messageContent.caption = caption;
      }

      const message = await this.sock.sendMessage(chatId, messageContent);
      return message;
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  getQRCode() {
    return this.qrCode;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasQR: !!this.qrCode
    };
  }
}

export default WhatsAppService;
