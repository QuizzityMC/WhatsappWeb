# WhatsApp Web Alternative

A self-hostable WhatsApp Web alternative built with Baileys (Node.js), Express, React, and TailwindCSS. This application allows you to connect to WhatsApp servers and use a web interface to send and receive messages.

## Features

### Backend
- ✅ WhatsApp connection via Baileys library
- ✅ QR code authentication
- ✅ RESTful API for chat operations
- ✅ Real-time message updates via WebSockets
- ✅ SQLite database for session and message storage
- ✅ Support for text and media messages
- ✅ Automatic reconnection handling

### Frontend
- ✅ Modern React UI with TailwindCSS
- ✅ Responsive design (mobile and desktop)
- ✅ QR code login page
- ✅ Chat list view
- ✅ Real-time messaging interface
- ✅ Infinite scroll for chat history
- ✅ File attachment support
- ✅ Real-time WebSocket updates

## Technology Stack

- **Backend**: Node.js, Express, Baileys, WebSocket, SQLite
- **Frontend**: React, Vite, TailwindCSS
- **Deployment**: Docker, Docker Compose

## Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- Active WhatsApp account with phone

## Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/QuizzityMC/WhatsappWeb.git
cd WhatsappWeb
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
   - Open your browser and navigate to `http://localhost`
   - Scan the QR code with your WhatsApp mobile app
   - Start chatting!

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Connection
- `GET /api/health` - Health check
- `GET /api/qr` - Get QR code for authentication
- `GET /api/status` - Get connection status

### Chats
- `GET /api/chats` - Get all chats
- `GET /api/chats/:chatId/messages` - Get messages for a chat (supports pagination via `limit` and `offset` query params)

### Messages
- `POST /api/messages/send` - Send text message
  ```json
  {
    "chatId": "1234567890@s.whatsapp.net",
    "text": "Hello, World!"
  }
  ```

- `POST /api/messages/send-media` - Send media message (multipart/form-data)
  - `chatId`: Chat ID
  - `file`: File to send
  - `caption`: Optional caption

### WebSocket
- `ws://localhost:3001/ws` - WebSocket endpoint for real-time updates

## Project Structure

```
WhatsappWeb/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # SQLite database configuration
│   │   ├── controllers/
│   │   │   └── whatsapp.js       # API controllers
│   │   ├── services/
│   │   │   └── whatsapp.js       # WhatsApp service using Baileys
│   │   └── index.js              # Express server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatList.jsx      # Chat list component
│   │   │   └── ChatWindow.jsx    # Chat window with messaging
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # QR code login page
│   │   │   └── MainPage.jsx      # Main chat interface
│   │   ├── hooks/
│   │   │   └── useWebSocket.js   # WebSocket hook
│   │   ├── utils/
│   │   │   └── api.js            # API client functions
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
DATABASE_PATH=./data/whatsapp.db
SESSION_PATH=./data/auth_info
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## How to Use

1. **Initial Setup**: When you first open the application, you'll see a QR code on the login page.

2. **Connect WhatsApp**:
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code displayed on the web page

3. **Start Messaging**:
   - Once connected, you'll see your chat list
   - Click on any chat to open the conversation
   - Type messages in the input box and press Enter or click Send
   - Click the attachment icon to send files

4. **Real-time Updates**: Messages are synced in real-time via WebSocket connection

## Features in Detail

### QR Code Authentication
- Automatic QR code generation
- Real-time connection status updates
- Persistent sessions (no need to re-scan on restart)

### Chat Management
- View all individual and group chats
- See last message and timestamp
- Unread message counter
- Auto-refresh chat list

### Messaging
- Send and receive text messages
- Send media files (images, videos, documents)
- Infinite scroll for message history (pagination)
- Real-time message delivery
- Message timestamps
- Visual distinction between sent and received messages

### Database Storage
- SQLite database for local storage
- Stores chat metadata
- Stores message history
- Persists WhatsApp session credentials

## Troubleshooting

### QR Code Not Appearing
- Check if the backend is running (`http://localhost:3001/api/health`)
- Ensure WhatsApp Web is not already connected on another device
- Try refreshing the page

### Messages Not Sending
- Verify WhatsApp connection status
- Check backend logs for errors
- Ensure the chat ID is correct

### WebSocket Connection Issues
- Check if port 3001 is accessible
- Verify firewall settings
- Check browser console for WebSocket errors

### Docker Issues
- Ensure Docker and Docker Compose are installed
- Check if ports 80 and 3001 are available
- View logs: `docker-compose logs -f`

## Security Considerations

1. **Session Storage**: WhatsApp session data is stored in the database. Keep this secure.
2. **Network**: Use HTTPS in production with proper SSL certificates.
3. **Firewall**: Restrict access to the application in production environments.
4. **Authentication**: Consider adding additional authentication layers for production use.

## Production Deployment

For production deployment:

1. Use environment variables for configuration
2. Enable HTTPS with SSL certificates
3. Use a reverse proxy (nginx) for additional security
4. Set up proper logging and monitoring
5. Regular backups of the database
6. Consider using PostgreSQL or MongoDB for better scalability

## Limitations

- This is a third-party implementation and not official WhatsApp software
- Subject to WhatsApp's terms of service
- May break if WhatsApp updates their protocol
- Not suitable for heavy commercial use

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer

This project is not affiliated with, authorized, maintained, sponsored or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API library
- [React](https://react.dev/) - Frontend framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Express](https://expressjs.com/) - Backend framework
