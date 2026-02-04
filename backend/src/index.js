import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import multer from 'multer';
import WhatsAppService from './services/whatsapp.js';
import WhatsAppController from './controllers/whatsapp.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Initialize WhatsApp service
const whatsappService = new WhatsAppService(wss);
const whatsappController = new WhatsAppController(whatsappService);

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  // Send current connection status
  ws.send(JSON.stringify({
    type: 'status',
    data: whatsappService.getConnectionStatus()
  }));

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WhatsApp Web Backend is running' });
});

app.get('/api/qr', (req, res) => whatsappController.getQRCode(req, res));
app.get('/api/status', (req, res) => whatsappController.getConnectionStatus(req, res));
app.get('/api/chats', (req, res) => whatsappController.getChats(req, res));
app.get('/api/chats/:chatId/messages', (req, res) => whatsappController.getChatMessages(req, res));
app.post('/api/messages/send', (req, res) => whatsappController.sendMessage(req, res));
app.post('/api/messages/send-media', upload.single('file'), (req, res) => whatsappController.sendMediaMessage(req, res));

// Initialize WhatsApp connection
whatsappService.initialize().catch(err => {
  console.error('Failed to initialize WhatsApp service:', err);
});

// Start server
server.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
  console.log(`WebSocket server running on ws://${host}:${port}/ws`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
