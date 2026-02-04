# Quick Start Guide

Get up and running with WhatsApp Web Alternative in 5 minutes!

## Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)
- A phone with WhatsApp installed

## Step 1: Clone the Repository

```bash
git clone https://github.com/QuizzityMC/WhatsappWeb.git
cd WhatsappWeb
```

## Step 2: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

You should see:
```
Server running on port 3000
Access the API at http://localhost:3000
```

## Step 3: Open the Frontend

```bash
# In a new terminal, from the project root
cd frontend

# Open index.html in your browser
# On Mac:
open index.html

# On Linux:
xdg-open index.html

# On Windows:
start index.html
```

Or simply drag and drop `frontend/index.html` into your browser.

## Step 4: Connect to Backend

1. In the frontend interface, the backend URL should already be set to `http://localhost:3000`
2. Click the **Connect** button
3. Wait for the QR code to appear

## Step 5: Scan QR Code

1. Open WhatsApp on your phone
2. Go to **Settings** (or **Menu**) → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code displayed in your browser

## Step 6: Start Chatting!

Once authenticated:
- Your chats will load automatically
- Click on any chat to view messages
- Type a message and click **Send**
- New messages will appear in real-time

## Common Issues

### QR Code Not Appearing

**Solution:**
- Check if backend is running
- Refresh the browser page
- Check browser console for errors

### Can't Scan QR Code

**Solution:**
- Ensure QR code is clear
- Update WhatsApp on your phone
- Check phone's internet connection

### Connection Failed

**Solution:**
- Verify backend URL is correct
- Check if port 3000 is available
- Check firewall settings

## Next Steps

### For Development

1. **Enable auto-reload:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check logs for debugging:**
   - Backend logs appear in terminal
   - Frontend logs in browser console (F12)

3. **Make changes:**
   - Backend: Edit files in `backend/`
   - Frontend: Edit files in `frontend/`

### For Production

1. **Deploy Backend:**
   - See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md)
   - Use VPS, Docker, or cloud platform

2. **Deploy Frontend:**
   - See [FRONTEND_DEPLOYMENT.md](FRONTEND_DEPLOYMENT.md)
   - Use GitHub Pages, Netlify, or Vercel

3. **Update frontend backend URL:**
   - Change to your deployed backend URL
   - Example: `https://your-backend.com`

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Testing the API

Test if the backend is working:

```bash
# Check server status
curl http://localhost:3000/

# Get authentication status
curl http://localhost:3000/api/auth/status

# Get QR code
curl http://localhost:3000/api/auth/qr
```

## Directory Structure

```
WhatsappWeb/
├── backend/              # Node.js backend
│   ├── services/        # WhatsApp service
│   ├── server.js        # Main server file
│   └── package.json     # Dependencies
├── frontend/            # Static frontend
│   ├── index.html       # Main HTML file
│   ├── app.js          # JavaScript application
│   └── styles.css      # Styles
└── README.md           # Documentation
```

## Helpful Commands

```bash
# Backend
cd backend
npm start                 # Start server
npm run dev              # Start with auto-reload
npm install              # Install dependencies

# Check if running
curl http://localhost:3000/

# View processes
ps aux | grep node

# Kill process (if needed)
kill -9 <PID>
```

## Features

✅ QR code authentication  
✅ View all chats  
✅ Send/receive text messages  
✅ Real-time updates  
✅ Contact management  
✅ Group support  
✅ Stateless frontend  
✅ GitHub Pages compatible  

## Limitations

⚠️ Media messages not fully supported  
⚠️ One session per number  
⚠️ Requires phone to be online for first auth  
⚠️ Session expires if phone is offline too long  

## Getting Help

1. **Check documentation:**
   - [README.md](README.md) - Overview
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

2. **Enable debug mode:**
   - Check backend terminal for errors
   - Open browser console (F12)
   - Look for error messages

3. **Open an issue:**
   - Go to GitHub Issues
   - Describe the problem
   - Include error messages
   - List what you've tried

## Tips

💡 **Keep backend running** - Frontend needs backend to work  
💡 **Use HTTPS in production** - For security  
💡 **Backup auth folder** - To preserve your session  
💡 **One session only** - Can't login multiple times with same number  
💡 **Stay updated** - Check for updates regularly  

## What's Next?

Now that you're set up:

1. **Explore the features** - Try sending messages, viewing chats
2. **Read the docs** - Learn about all available features
3. **Deploy to production** - Make it accessible from anywhere
4. **Customize** - Modify to fit your needs
5. **Contribute** - Help improve the project

## Congratulations! 🎉

You've successfully set up WhatsApp Web Alternative!

If you encounter any issues, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue on GitHub.

Happy messaging! 📱💬
