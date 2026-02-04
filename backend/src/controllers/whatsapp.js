import QRCode from 'qrcode';

class WhatsAppController {
  constructor(whatsappService) {
    this.whatsappService = whatsappService;
  }

  async getQRCode(req, res) {
    try {
      const qr = this.whatsappService.getQRCode();
      
      if (!qr) {
        return res.json({ 
          success: false, 
          message: 'No QR code available. Either connected or waiting for QR.' 
        });
      }

      const qrImage = await QRCode.toDataURL(qr);
      res.json({ success: true, qr: qrImage });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getConnectionStatus(req, res) {
    try {
      const status = this.whatsappService.getConnectionStatus();
      res.json({ success: true, ...status });
    } catch (error) {
      console.error('Error getting connection status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getChats(req, res) {
    try {
      const chats = await this.whatsappService.getChats();
      res.json({ success: true, chats });
    } catch (error) {
      console.error('Error getting chats:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const messages = await this.whatsappService.getChatMessages(chatId, limit, offset);
      res.json({ success: true, messages });
    } catch (error) {
      console.error('Error getting chat messages:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const { chatId, text } = req.body;

      if (!chatId || !text) {
        return res.status(400).json({ 
          success: false, 
          error: 'chatId and text are required' 
        });
      }

      const message = await this.whatsappService.sendMessage(chatId, text);
      res.json({ success: true, message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async sendMediaMessage(req, res) {
    try {
      const { chatId, caption } = req.body;
      const file = req.file;

      if (!chatId || !file) {
        return res.status(400).json({ 
          success: false, 
          error: 'chatId and file are required' 
        });
      }

      const message = await this.whatsappService.sendMediaMessage(
        chatId, 
        file.buffer, 
        file.mimetype, 
        caption
      );
      
      res.json({ success: true, message });
    } catch (error) {
      console.error('Error sending media message:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default WhatsAppController;
