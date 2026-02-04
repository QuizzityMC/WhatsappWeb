const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const apiClient = {
  async getQRCode() {
    const response = await fetch(`${API_URL}/api/qr`);
    return response.json();
  },

  async getConnectionStatus() {
    const response = await fetch(`${API_URL}/api/status`);
    return response.json();
  },

  async getChats() {
    const response = await fetch(`${API_URL}/api/chats`);
    return response.json();
  },

  async getChatMessages(chatId, limit = 50, offset = 0) {
    const response = await fetch(
      `${API_URL}/api/chats/${encodeURIComponent(chatId)}/messages?limit=${limit}&offset=${offset}`
    );
    return response.json();
  },

  async sendMessage(chatId, text) {
    const response = await fetch(`${API_URL}/api/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text })
    });
    return response.json();
  },

  async sendMediaMessage(chatId, file, caption) {
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await fetch(`${API_URL}/api/messages/send-media`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
};

export const createWebSocketConnection = (onMessage) => {
  const ws = new WebSocket(`${WS_URL}/ws`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => createWebSocketConnection(onMessage), 5000);
  };

  return ws;
};
