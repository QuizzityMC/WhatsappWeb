# WhatsApp Web Alternative

A self-hosted WhatsApp Web alternative built with Baileys library. This project provides a complete separation between frontend and backend, allowing you to deploy the frontend on GitHub Pages while running the backend on your own server.

📚 **[Documentation Index](DOCS_INDEX.md)** - Find all guides and troubleshooting docs

## ⚠️ Important: Network Requirements

**The backend MUST have unrestricted access to WhatsApp servers** (`web.whatsapp.com`). 

- ✅ **Works:** Personal computer, standard VPS, home network
- ❌ **Doesn't Work:** GitHub Codespaces, restricted corporate networks, some cloud IDEs

**Before starting, run:** `cd backend && npm run check` to verify connectivity.

📖 **Seeing connection errors?** Read **[SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md)** for a quick fix guide.

💡 **For detailed information:** See [NETWORK_GUIDE.md](NETWORK_GUIDE.md)

## Features

- 🔐 Server-side authentication and session management
- 💬 Send and receive WhatsApp messages
- 👥 View contacts and groups
- 📱 QR code authentication
- 🔄 Real-time message updates via WebSocket
- 🌐 Stateless frontend deployable on GitHub Pages
- 🚀 Easy deployment and setup

## Architecture

### Backend
- Node.js + Express server
- Baileys library for WhatsApp connection
- WebSocket (Socket.IO) for real-time updates
- REST APIs for chat management
- Server-side credential storage

### Frontend
- Pure HTML/CSS/JavaScript (no build process)
- Stateless design
- Socket.IO client for real-time updates
- GitHub Pages compatible

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- A phone with WhatsApp installed
- A server/VPS for backend deployment (or run locally)
- **Active internet connection with access to web.whatsapp.com** (required for WhatsApp connection)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will start on `http://localhost:3000` by default.

**Note:** If you see "QR Code received" repeatedly or network errors, see [QR_CODE_ISSUE.md](QR_CODE_ISSUE.md) for troubleshooting.

### Frontend Setup

#### Local Testing

1. Open `frontend/index.html` in your browser
2. Enter your backend URL (e.g., `http://localhost:3000`)
3. Click "Connect"
4. Scan the QR code with your WhatsApp mobile app

#### Deploy to GitHub Pages

1. Fork this repository
2. Go to repository Settings → Pages
3. Select the branch containing your code
4. Set the source folder to `/frontend` (or set root and navigate to frontend)
5. Save and wait for deployment
6. Your frontend will be available at `https://[your-username].github.io/WhatsappWeb/frontend/`

**Important:** Update the backend URL in the frontend to point to your deployed backend server.

## Backend API Documentation

### Authentication Endpoints

#### Get QR Code
```
GET /api/auth/qr
```
Returns the QR code for WhatsApp authentication.

Response:
```json
{
  "success": true,
  "qr": "data:image/png;base64,..."
}
```

#### Get Connection Status
```
GET /api/auth/status
```
Returns the current connection status.

Response:
```json
{
  "success": true,
  "status": {
    "status": "connected",
    "user": {
      "id": "...",
      "name": "..."
    }
  }
}
```

#### Logout
```
POST /api/auth/logout
```
Logs out from WhatsApp and clears session.

### Chat Endpoints

#### Get All Chats
```
GET /api/chats
```
Returns all available chats.

Response:
```json
{
  "success": true,
  "chats": [
    {
      "id": "1234567890@s.whatsapp.net",
      "name": "Contact Name",
      "conversationTimestamp": 1234567890,
      "unreadCount": 5
    }
  ]
}
```

#### Get Messages from Chat
```
GET /api/chats/:chatId/messages?limit=50
```
Returns messages from a specific chat.

Parameters:
- `chatId`: The chat ID
- `limit`: Number of messages to retrieve (default: 50)

### Message Endpoints

#### Send Message
```
POST /api/messages/send
```

Body:
```json
{
  "chatId": "1234567890@s.whatsapp.net",
  "message": "Hello World",
  "type": "text"
}
```

Response:
```json
{
  "success": true,
  "result": { ... }
}
```

### Contact Endpoints

#### Get All Contacts
```
GET /api/contacts
```
Returns all contacts.

### Group Endpoints

#### Get All Groups
```
GET /api/groups
```
Returns all groups.

## WebSocket Events

The backend emits the following events via Socket.IO:

- `qr`: Emitted when a new QR code is generated
- `connection-status`: Emitted when connection status changes
- `new-message`: Emitted when a new message is received
- `chats-update`: Emitted when chats are updated
- `contacts-update`: Emitted when contacts are updated

## Deployment Guide

### Backend Deployment

#### Using a VPS (Ubuntu/Debian)

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Clone and setup:
```bash
git clone <your-repo-url>
cd WhatsappWeb/backend
npm install
```

3. Install PM2 for process management:
```bash
sudo npm install -g pm2
```

4. Start the application:
```bash
pm2 start server.js --name whatsapp-backend
pm2 startup
pm2 save
```

5. Configure firewall:
```bash
sudo ufw allow 3000
```

#### Using Docker

Create a `Dockerfile` in the backend directory:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t whatsapp-backend .
docker run -d -p 3000:3000 -v $(pwd)/auth_info_baileys:/app/auth_info_baileys whatsapp-backend
```

### Frontend Deployment

The frontend is already configured for GitHub Pages. Simply:

1. Push your changes to GitHub
2. Enable GitHub Pages in repository settings
3. Select the appropriate branch and folder
4. Access your site at the provided URL

**Note:** Make sure to update the backend URL in the frontend to point to your deployed backend server.

## Environment Variables

The backend supports the following environment variables:

- `PORT`: Server port (default: 3000)

Create a `.env` file in the backend directory:
```
PORT=3000
```

## Troubleshooting

### Network Connectivity Issues (IMPORTANT)

**Before starting the backend, check network connectivity:**
```bash
cd backend
npm run check
```

If you see `❌ FAILED: Cannot resolve web.whatsapp.com`, your environment **cannot reach WhatsApp servers**. This is a common issue in:
- GitHub Codespaces
- Some cloud IDEs (Replit, Gitpod, etc.)
- Corporate/school networks that block WhatsApp
- Restricted VPS/server environments

**Solutions:**
- Deploy on a VPS with unrestricted internet access
- Run locally on your personal computer
- Use a mobile hotspot instead of restricted network
- Check firewall/proxy settings

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#issue-baileys-connection-keeps-failing) for detailed solutions.

### Connection Issues

1. **QR Code not appearing:**
   - Check backend logs for errors
   - Run `npm run check` to verify network connectivity
   - Ensure the backend is running and accessible
   - Verify the backend URL in the frontend

2. **Cannot scan QR code:**
   - Make sure your phone has an active internet connection
   - Ensure WhatsApp is updated to the latest version
   - Try generating a new QR code by refreshing the page

3. **Messages not sending:**
   - Check if you're still connected (connection status)
   - Verify the chat ID is correct
   - Check backend logs for errors

### CORS Issues

If you encounter CORS issues when deploying:

1. Update the CORS configuration in `backend/server.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: 'https://your-github-pages-url.github.io',
    methods: ['GET', 'POST']
  }
});
```

2. Also update the Express CORS middleware:
```javascript
app.use(cors({
  origin: 'https://your-github-pages-url.github.io'
}));
```

### Authentication Persistence

Session data is stored in `backend/auth_info_baileys/`. To maintain your session:

- Keep this folder backed up
- Don't delete it unless you want to logout
- Mount it as a volume if using Docker

## Security Considerations

1. **Never expose your backend directly to the internet without proper security:**
   - Use a reverse proxy (nginx/Apache)
   - Enable HTTPS with SSL certificates
   - Implement rate limiting
   - Add authentication for API endpoints

2. **Secure your session data:**
   - The `auth_info_baileys` folder contains sensitive credentials
   - Keep it private and secure
   - Regular backups recommended

3. **Frontend security:**
   - The frontend is stateless and doesn't store credentials
   - All sensitive operations happen server-side
   - Always use HTTPS for your backend in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer

This project is not affiliated with or endorsed by WhatsApp. Use at your own risk and make sure you comply with WhatsApp's Terms of Service.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review backend logs
3. Open an issue on GitHub with detailed information
