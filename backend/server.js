const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const WhatsAppService = require('./services/whatsapp');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize WhatsApp Service
const whatsappService = new WhatsAppService(io);

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'WhatsApp Web Backend API',
    version: '1.0.0'
  });
});

// Authentication endpoints
app.get('/api/auth/qr', async (req, res) => {
  try {
    const qrCode = await whatsappService.getQRCode();
    if (qrCode) {
      res.json({ success: true, qr: qrCode });
    } else {
      res.json({ success: false, message: 'Already authenticated or QR not ready' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/status', (req, res) => {
  const status = whatsappService.getConnectionStatus();
  res.json({ success: true, status });
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    await whatsappService.logout();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat endpoints
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await whatsappService.getChats();
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await whatsappService.getMessages(chatId, limit);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Message endpoints
app.post('/api/messages/send', async (req, res) => {
  try {
    const { chatId, message, type = 'text' } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId and message are required' 
      });
    }

    const result = await whatsappService.sendMessage(chatId, message, type);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Contacts endpoints
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await whatsappService.getContacts();
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Groups endpoints
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await whatsappService.getGroups();
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize WhatsApp connection
whatsappService.initialize().catch(err => {
  console.error('Failed to initialize WhatsApp service:', err);
});

// Start server
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 WhatsApp Web Backend Server Started');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Access the API at http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n💡 Tip: If connection fails, run: npm run check');
  console.log('   to diagnose network connectivity issues\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await whatsappService.disconnect();
  process.exit(0);
});
