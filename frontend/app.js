// WhatsApp Web Frontend Application
class WhatsAppClient {
    constructor() {
        this.backendUrl = localStorage.getItem('backendUrl') || 'http://localhost:3000';
        this.socket = null;
        this.currentChat = null;
        this.chats = [];
        this.isConnected = false;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // QR Section elements
        this.qrSection = document.getElementById('qr-section');
        this.qrCode = document.getElementById('qr-code');
        this.qrPlaceholder = document.getElementById('qr-placeholder');
        this.connectionStatus = document.getElementById('connection-status');
        this.backendUrlInput = document.getElementById('backend-url');
        this.connectBtn = document.getElementById('connect-btn');

        // Chat Section elements
        this.chatSection = document.getElementById('chat-section');
        this.chatsList = document.getElementById('chats-list');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.noChatSelected = document.getElementById('no-chat-selected');
        this.chatWindow = document.getElementById('chat-window');
        this.currentChatName = document.getElementById('current-chat-name');
        this.searchChat = document.getElementById('search-chat');

        // Set stored backend URL
        this.backendUrlInput.value = this.backendUrl;
    }

    attachEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.searchChat.addEventListener('input', (e) => this.filterChats(e.target.value));
    }

    async connect() {
        this.backendUrl = this.backendUrlInput.value;
        localStorage.setItem('backendUrl', this.backendUrl);
        
        this.updateStatus('Connecting to server...');
        
        try {
            // Test connection
            const response = await fetch(`${this.backendUrl}/`);
            const data = await response.json();
            
            if (data.status === 'online') {
                this.updateStatus('Connected to server');
                this.initializeSocketConnection();
                this.checkAuthStatus();
            } else {
                this.updateStatus('Server error');
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.updateStatus('Failed to connect to server. Please check the URL.');
        }
    }

    initializeSocketConnection() {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(this.backendUrl);

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected = true;
        });

        this.socket.on('qr', (data) => {
            this.displayQRCode(data.qr);
        });

        this.socket.on('connection-status', (data) => {
            console.log('Connection status:', data.status);
            
            if (data.status === 'connected') {
                this.onAuthenticated();
            } else if (data.status === 'disconnected') {
                this.showQRSection();
            } else if (data.status === 'error') {
                this.updateStatus(`Error: ${data.error || 'Connection error'}`);
                this.qrPlaceholder.innerHTML = `
                    <div style="color: #d32f2f; text-align: center;">
                        <h3>⚠️ Connection Error</h3>
                        <p>${this.escapeHtml(data.error || 'Cannot connect to WhatsApp')}</p>
                        <p style="font-size: 14px; margin-top: 10px;">
                            Please check:<br>
                            • Internet connection<br>
                            • Backend server logs<br>
                            • Firewall settings
                        </p>
                    </div>
                `;
                this.qrCode.style.display = 'none';
                this.qrPlaceholder.style.display = 'block';
            }
        });

        this.socket.on('new-message', (data) => {
            this.handleNewMessage(data);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/status`);
            const data = await response.json();
            
            if (data.success && data.status.status === 'connected') {
                this.onAuthenticated();
            } else {
                await this.requestQRCode();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.updateStatus('Error checking authentication status');
        }
    }

    async requestQRCode() {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/qr`);
            const data = await response.json();
            
            if (data.success && data.qr) {
                this.displayQRCode(data.qr);
            } else {
                this.updateStatus('Waiting for QR code...');
            }
        } catch (error) {
            console.error('Error requesting QR code:', error);
            this.updateStatus('Error getting QR code');
        }
    }

    displayQRCode(qrDataUrl) {
        this.qrCode.src = qrDataUrl;
        this.qrCode.style.display = 'block';
        this.qrPlaceholder.style.display = 'none';
        this.updateStatus('Scan the QR code with your phone');
    }

    updateStatus(message) {
        this.connectionStatus.textContent = message;
    }

    showQRSection() {
        this.qrSection.style.display = 'block';
        this.chatSection.style.display = 'none';
    }

    showChatSection() {
        this.qrSection.style.display = 'none';
        this.chatSection.style.display = 'block';
    }

    async onAuthenticated() {
        console.log('Authenticated successfully');
        this.showChatSection();
        await this.loadChats();
    }

    async loadChats() {
        try {
            const response = await fetch(`${this.backendUrl}/api/chats`);
            const data = await response.json();
            
            if (data.success) {
                this.chats = data.chats;
                this.renderChats(this.chats);
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    }

    renderChats(chats) {
        if (chats.length === 0) {
            this.chatsList.innerHTML = '<div class="no-chats">No chats available</div>';
            return;
        }

        this.chatsList.innerHTML = chats.map(chat => `
            <div class="chat-item" data-chat-id="${chat.id}">
                <div class="chat-item-name">${this.escapeHtml(chat.name)}</div>
                <div class="chat-item-preview">
                    ${chat.unreadCount > 0 ? `${chat.unreadCount} new messages` : 'Tap to open'}
                </div>
            </div>
        `).join('');

        // Attach click listeners
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatId = item.getAttribute('data-chat-id');
                this.openChat(chatId);
            });
        });
    }

    filterChats(query) {
        const filtered = this.chats.filter(chat => 
            chat.name.toLowerCase().includes(query.toLowerCase())
        );
        this.renderChats(filtered);
    }

    async openChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        this.currentChat = chat;
        this.currentChatName.textContent = chat.name;

        // Update active state
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-chat-id') === chatId) {
                item.classList.add('active');
            }
        });

        // Show chat window
        this.noChatSelected.style.display = 'none';
        this.chatWindow.style.display = 'flex';

        // Load messages
        await this.loadMessages(chatId);
    }

    async loadMessages(chatId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/chats/${encodeURIComponent(chatId)}/messages`);
            const data = await response.json();
            
            if (data.success) {
                this.renderMessages(data.messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    renderMessages(messages) {
        if (!messages || messages.length === 0) {
            this.messagesContainer.innerHTML = '<div class="no-chats">No messages yet</div>';
            return;
        }

        this.messagesContainer.innerHTML = messages.map(msg => {
            const isFromMe = msg.key?.fromMe || false;
            const text = msg.message?.conversation || 
                        msg.message?.extendedTextMessage?.text || 
                        '[Media message]';
            const time = new Date(msg.messageTimestamp * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="message ${isFromMe ? 'sent' : 'received'}">
                    <div class="message-bubble">
                        <div class="message-text">${this.escapeHtml(text)}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || !this.currentChat) return;

        try {
            const response = await fetch(`${this.backendUrl}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatId: this.currentChat.id,
                    message: message,
                    type: 'text'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.messageInput.value = '';
                // Reload messages to show the sent message
                await this.loadMessages(this.currentChat.id);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    }

    handleNewMessage(data) {
        // If the message is for the current open chat, reload messages
        if (this.currentChat && data.chatId === this.currentChat.id) {
            this.loadMessages(this.currentChat.id);
        }
        
        // Reload chats to update unread counts
        this.loadChats();
    }

    async logout() {
        if (!confirm('Are you sure you want to logout?')) return;

        try {
            const response = await fetch(`${this.backendUrl}/api/auth/logout`, {
                method: 'POST'
            });

            const data = await response.json();
            
            if (data.success) {
                this.showQRSection();
                this.currentChat = null;
                this.chats = [];
                this.qrCode.style.display = 'none';
                this.qrPlaceholder.style.display = 'block';
                this.updateStatus('Logged out. Scan QR code to log in again.');
                
                // Request new QR code
                setTimeout(() => this.requestQRCode(), 1000);
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to logout');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new WhatsAppClient();
    window.whatsappClient = app; // For debugging
});
