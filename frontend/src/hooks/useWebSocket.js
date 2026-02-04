import { useState, useEffect } from 'react';
import { createWebSocketConnection } from '../utils/api';

export const useWebSocket = () => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const websocket = createWebSocketConnection((data) => {
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.data]);
      } else if (data.type === 'status' || data.type === 'connected' || data.type === 'disconnected') {
        setStatus(data);
      } else if (data.type === 'qr') {
        setStatus(data);
      }
    });

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  return { ws, messages, status };
};
