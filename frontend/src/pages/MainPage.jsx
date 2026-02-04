import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

function MainPage({ onLogout }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const { messages: newMessages } = useWebSocket();

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadChats = async () => {
    try {
      const response = await apiClient.getChats();
      if (response.success) {
        setChats(response.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <h1 className="text-2xl font-bold">WhatsApp Web</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full shadow-lg">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
        />
        <ChatWindow chat={selectedChat} newMessages={newMessages} />
      </div>
    </div>
  );
}

export default MainPage;
