function ChatList({ chats, selectedChat, onSelectChat }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats available
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
                selectedChat?.id === chat.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {chat.name || chat.id}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(chat.last_message_time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
                {chat.unread_count > 0 && (
                  <div className="ml-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {chat.unread_count}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
