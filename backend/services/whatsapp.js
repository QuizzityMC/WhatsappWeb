const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor(io) {
    this.io = io;
    this.sock = null;
    this.qr = null;
    this.state = null;
    this.saveCreds = null;
    this.connectionStatus = 'disconnected';
    this.authFolder = path.join(__dirname, '..', 'auth_info_baileys');
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    
    // Store chats and contacts in memory
    this.chats = new Map();
    this.contacts = new Map();
    this.messages = new Map();
    
    // Ensure auth folder exists
    if (!fs.existsSync(this.authFolder)) {
      fs.mkdirSync(this.authFolder, { recursive: true });
    }
  }

  async initialize() {
    try {
      if (this.reconnectAttempts === 0) {
        console.log('\n🔌 Initializing WhatsApp connection...');
      } else {
        console.log(`\n🔄 Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      }
      
      // Load auth state
      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
      this.state = state;
      this.saveCreds = saveCreds;

      // Get latest Baileys version
      const { version, isLatest } = await fetchLatestBaileysVersion();
      if (this.reconnectAttempts === 0) {
        console.log(`📦 Using Baileys v${version.join('.')} ${isLatest ? '(latest)' : ''}`);
      }

      // Create socket connection
      this.sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: ['WhatsApp Web', 'Chrome', '110.0.0'],
        markOnlineOnConnect: true
      });

      // Handle connection updates
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log('📱 QR Code received - scan with WhatsApp mobile app');
          this.qr = await QRCode.toDataURL(qr);
          this.io.emit('qr', { qr: this.qr });
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const errorMessage = lastDisconnect?.error?.message || 'Unknown error';
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log('Connection closed:', {
            statusCode,
            error: errorMessage,
            shouldReconnect,
            attempts: this.reconnectAttempts
          });
          
          // Check for network errors
          if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
            console.error('❌ NETWORK ERROR: Cannot reach WhatsApp servers.');
            console.error('Please check your internet connection and ensure web.whatsapp.com is accessible.');
            this.connectionStatus = 'error';
            this.io.emit('connection-status', { 
              status: 'error',
              error: 'Cannot reach WhatsApp servers. Please check your internet connection.'
            });
            
            // Stop reconnecting after max attempts for network errors
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
              return;
            }
          }
          
          this.connectionStatus = 'disconnected';
          this.io.emit('connection-status', { status: 'disconnected' });

          if (shouldReconnect) {
            this.reconnectAttempts++;
            const delay = Math.min(3000 * this.reconnectAttempts, 30000); // Max 30s delay
            console.log(`Will retry in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.initialize(), delay);
          } else {
            this.reconnectAttempts = 0;
          }
        } else if (connection === 'open') {
          console.log('✅ Connection opened successfully');
          this.reconnectAttempts = 0; // Reset attempts on successful connection
          this.connectionStatus = 'connected';
          this.qr = null;
          this.io.emit('connection-status', { status: 'connected' });
        } else if (connection === 'connecting') {
          console.log('Connecting...');
          this.connectionStatus = 'connecting';
          this.io.emit('connection-status', { status: 'connecting' });
        }
      });

      // Handle credentials update
      this.sock.ev.on('creds.update', saveCreds);

      // Handle messages
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        console.log('Messages received:', messages.length);
        
        for (const msg of messages) {
          // Store message
          const chatId = msg.key.remoteJid;
          if (!this.messages.has(chatId)) {
            this.messages.set(chatId, []);
          }
          this.messages.get(chatId).push(msg);
          
          if (!msg.key.fromMe && type === 'notify') {
            this.io.emit('new-message', {
              chatId: msg.key.remoteJid,
              message: msg,
              timestamp: msg.messageTimestamp
            });
          }
        }
      });

      // Handle chats update
      this.sock.ev.on('chats.set', ({ chats }) => {
        console.log('Chats set:', chats.length);
        chats.forEach(chat => {
          this.chats.set(chat.id, chat);
        });
      });

      this.sock.ev.on('chats.upsert', (chats) => {
        console.log('Chats upsert:', chats.length);
        chats.forEach(chat => {
          this.chats.set(chat.id, chat);
        });
        this.io.emit('chats-update', { chats });
      });

      this.sock.ev.on('chats.update', (chats) => {
        console.log('Chats update:', chats.length);
        chats.forEach(chat => {
          const existing = this.chats.get(chat.id);
          if (existing) {
            this.chats.set(chat.id, { ...existing, ...chat });
          }
        });
        this.io.emit('chats-update', { chats });
      });

      // Handle contacts update
      this.sock.ev.on('contacts.set', ({ contacts }) => {
        console.log('Contacts set:', contacts.length);
        contacts.forEach(contact => {
          this.contacts.set(contact.id, contact);
        });
      });

      this.sock.ev.on('contacts.upsert', (contacts) => {
        console.log('Contacts upsert:', contacts.length);
        contacts.forEach(contact => {
          this.contacts.set(contact.id, contact);
        });
        this.io.emit('contacts-update', { contacts });
      });

      this.sock.ev.on('contacts.update', (contacts) => {
        console.log('Contacts update:', contacts.length);
        contacts.forEach(contact => {
          const existing = this.contacts.get(contact.id);
          if (existing) {
            this.contacts.set(contact.id, { ...existing, ...contact });
          }
        });
        this.io.emit('contacts-update', { contacts });
      });

    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  async getQRCode() {
    return this.qr;
  }

  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      user: this.sock?.user || null
    };
  }

  async getChats() {
    if (!this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const chats = Array.from(this.chats.values());
      return chats.map(chat => ({
        id: chat.id,
        name: chat.name || chat.id,
        conversationTimestamp: chat.conversationTimestamp,
        unreadCount: chat.unreadCount || 0
      }));
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  async getMessages(chatId, limit = 50) {
    if (!this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      // Try to fetch messages from Baileys
      const messages = await this.sock.fetchMessagesFromWA(chatId, limit).catch(() => {
        // If fetch fails, return stored messages
        return this.messages.get(chatId) || [];
      });
      
      return messages.slice(-limit);
    } catch (error) {
      console.error('Error getting messages:', error);
      // Return stored messages as fallback
      return (this.messages.get(chatId) || []).slice(-limit);
    }
  }

  async sendMessage(chatId, message, type = 'text') {
    if (!this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      let result;
      
      if (type === 'text') {
        result = await this.sock.sendMessage(chatId, { text: message });
      } else {
        throw new Error(`Message type '${type}' not implemented yet`);
      }

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getContacts() {
    if (!this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const contacts = Array.from(this.contacts.values());
      return contacts.map(contact => ({
        id: contact.id,
        name: contact.name || contact.notify || contact.verifiedName || contact.id,
        notify: contact.notify
      }));
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async getGroups() {
    if (!this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const chats = Array.from(this.chats.values());
      const groups = chats.filter(chat => chat.id.endsWith('@g.us'));
      return groups.map(group => ({
        id: group.id,
        name: group.name || group.id,
        participantsCount: group.participants?.length || 0
      }));
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }

  async logout() {
    if (!this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      await this.sock.logout();
      this.connectionStatus = 'disconnected';
      this.qr = null;
      
      // Clear auth folder
      if (fs.existsSync(this.authFolder)) {
        fs.rmSync(this.authFolder, { recursive: true, force: true });
        fs.mkdirSync(this.authFolder, { recursive: true });
      }
      
      this.io.emit('connection-status', { status: 'disconnected' });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.end();
      this.sock = null;
    }
  }
}

module.exports = WhatsAppService;
