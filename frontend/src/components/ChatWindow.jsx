import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/api';

function ChatWindow({ chat, newMessages }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chat) {
      loadMessages(true);
    }
  }, [chat]);

  useEffect(() => {
    // Add new messages from WebSocket
    if (newMessages.length > 0) {
      const chatMessages = newMessages.filter(msg => msg.chatId === chat?.id);
      if (chatMessages.length > 0) {
        setMessages(prev => [...prev, ...chatMessages]);
        scrollToBottom();
      }
    }
  }, [newMessages, chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (reset = false) => {
    if (!chat || loading) return;

    try {
      setLoading(true);
      const newOffset = reset ? 0 : offset;
      const response = await apiClient.getChatMessages(chat.id, 50, newOffset);
      
      if (response.success) {
        if (reset) {
          setMessages(response.messages.reverse());
          setOffset(response.messages.length);
        } else {
          setMessages(prev => [...response.messages.reverse(), ...prev]);
          setOffset(prev => prev + response.messages.length);
        }
        setHasMore(response.messages.length === 50);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !loading) {
      loadMessages();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim() || !chat || sending) return;

    try {
      setSending(true);
      const response = await apiClient.sendMessage(chat.id, inputText);
      
      if (response.success) {
        setInputText('');
        // Message will be added via WebSocket or reload
        await loadMessages(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !chat) return;

    try {
      setSending(true);
      const response = await apiClient.sendMediaMessage(chat.id, file, '');
      
      if (response.success) {
        await loadMessages(true);
      }
    } catch (error) {
      console.error('Error sending file:', error);
      alert('Failed to send file');
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Select a chat</h3>
          <p className="text-gray-500 mt-1">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {chat.name || chat.id}
        </h2>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {loading && offset === 0 && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                msg.from_me
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm break-words">{msg.message_text}</p>
              <span
                className={`text-xs mt-1 block ${
                  msg.from_me ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,application/*"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
