# Troubleshooting Guide

This guide helps you resolve common issues when setting up and running the WhatsApp Web alternative.

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Connection Issues](#connection-issues)
4. [Authentication Issues](#authentication-issues)
5. [Message Issues](#message-issues)

## Backend Issues

### Issue: Dependencies fail to install

**Symptoms:**
- `npm install` fails
- Missing package errors

**Solutions:**
1. Update Node.js to version 16 or higher:
   ```bash
   node --version
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Try using a different registry:
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

### Issue: Port already in use

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Find and kill the process using port 3000:
   ```bash
   # Linux/Mac
   lsof -i :3000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm start
   ```

### Issue: Baileys connection keeps failing

**Symptoms:**
- "Connection closed. Reconnect: true" repeated in logs
- QR code doesn't appear

**Solutions:**
1. Delete authentication folder and restart:
   ```bash
   rm -rf auth_info_baileys
   npm start
   ```

2. Check your internet connection

3. Verify WhatsApp Web is working in your browser

4. Update Baileys to latest version:
   ```bash
   npm update @whiskeysockets/baileys
   ```

### Issue: Server crashes on startup

**Symptoms:**
- Server exits immediately
- TypeError or ReferenceError in logs

**Solutions:**
1. Check Node.js version (must be 16+)

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check for syntax errors in your code

4. Review error logs for specific issues

## Frontend Issues

### Issue: Frontend can't connect to backend

**Symptoms:**
- "Failed to connect to server" message
- CORS errors in browser console

**Solutions:**
1. Verify backend URL is correct:
   - Check if backend is running
   - Try accessing backend URL directly in browser
   - Ensure URL includes `http://` or `https://`

2. Check backend CORS configuration in `server.js`:
   ```javascript
   app.use(cors({
     origin: '*' // or your specific frontend URL
   }));
   ```

3. If using HTTPS frontend with HTTP backend:
   - Modern browsers block mixed content
   - Either use HTTPS for backend or HTTP for frontend

4. Check browser console for specific errors

### Issue: QR code doesn't appear

**Symptoms:**
- Loader spinning indefinitely
- "Waiting for QR code..." message persists

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:3000/api/auth/status
   ```

2. Check browser console for errors

3. Try refreshing the page

4. Verify WebSocket connection is working:
   - Open browser DevTools → Network tab
   - Look for Socket.IO connection
   - Check for WebSocket upgrade

5. Clear browser cache and localStorage:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

### Issue: Static assets not loading on GitHub Pages

**Symptoms:**
- Styles not applied
- Scripts not loading
- 404 errors for assets

**Solutions:**
1. Ensure all paths are relative:
   ```html
   <!-- Good -->
   <link rel="stylesheet" href="styles.css">
   
   <!-- Bad -->
   <link rel="stylesheet" href="/styles.css">
   ```

2. Check GitHub Pages settings:
   - Verify correct branch is selected
   - Verify correct folder is selected

3. Wait a few minutes after pushing changes

4. Check repository is public or you have GitHub Pages enabled

## Connection Issues

### Issue: Socket.IO disconnects frequently

**Symptoms:**
- "Socket disconnected" in console
- Connection status flickers

**Solutions:**
1. Check network stability

2. Increase Socket.IO timeout in `server.js`:
   ```javascript
   const io = new Server(server, {
     pingTimeout: 60000,
     cors: { origin: '*' }
   });
   ```

3. Check for proxy or firewall blocking WebSocket

4. Try using polling transport:
   ```javascript
   const socket = io(this.backendUrl, {
     transports: ['polling', 'websocket']
   });
   ```

### Issue: Backend disconnects after QR scan

**Symptoms:**
- Successfully scan QR code
- Connection immediately drops
- "Connection closed" in logs

**Solutions:**
1. Check WhatsApp is not logged in elsewhere:
   - Only one active session allowed per number
   - Logout from other devices/browsers

2. Ensure WhatsApp app is updated on your phone

3. Try using a different phone number

4. Delete `auth_info_baileys` and start fresh

### Issue: High latency or slow responses

**Symptoms:**
- Messages take long to send
- Chats load slowly
- UI feels sluggish

**Solutions:**
1. Check server resources:
   ```bash
   # CPU and memory usage
   top
   
   # Disk space
   df -h
   ```

2. Restart backend server

3. Check network latency between frontend and backend

4. Consider using a CDN for frontend assets

5. Optimize backend queries (add caching if needed)

## Authentication Issues

### Issue: Can't scan QR code

**Symptoms:**
- QR code appears but scanning fails
- "Invalid QR code" error on phone

**Solutions:**
1. Ensure QR code is clear and not pixelated:
   - Try zooming in/out
   - Ensure good lighting
   - Clean your phone camera

2. Generate a new QR code:
   - Refresh the page
   - Or restart backend

3. Check phone's WhatsApp version:
   - Update to latest version

4. Ensure phone has internet connection

5. Try using a different phone

### Issue: Authentication doesn't persist

**Symptoms:**
- Need to scan QR code on every restart
- Session not saved

**Solutions:**
1. Check `auth_info_baileys` folder exists and has write permissions:
   ```bash
   ls -la auth_info_baileys
   chmod 755 auth_info_baileys
   ```

2. Ensure folder is not being deleted:
   - Check if it's in `.gitignore`
   - For Docker: verify volume mount
   - For Heroku: use persistent storage addon

3. Check for errors in logs when saving credentials

4. Verify `saveCreds` is being called:
   ```javascript
   this.sock.ev.on('creds.update', saveCreds);
   ```

### Issue: Logged out unexpectedly

**Symptoms:**
- Session ends without action
- Need to re-authenticate

**Solutions:**
1. Check if WhatsApp logged out from phone:
   - Open WhatsApp → Settings → Linked Devices
   - Verify device is still listed

2. Check backend logs for errors

3. Ensure `auth_info_baileys` folder wasn't deleted

4. Check for connection issues

## Message Issues

### Issue: Messages not sending

**Symptoms:**
- Click send but nothing happens
- Error message appears
- Message stuck in sending state

**Solutions:**
1. Check connection status:
   - Must be "connected" to send messages
   - Check backend logs

2. Verify chat ID is correct:
   ```bash
   # Test API directly
   curl -X POST http://localhost:3000/api/messages/send \
     -H "Content-Type: application/json" \
     -d '{"chatId":"CHAT_ID","message":"test"}'
   ```

3. Check for rate limiting from WhatsApp

4. Ensure you have permission to send to that chat

5. Try sending from WhatsApp app to verify account status

### Issue: Messages not receiving

**Symptoms:**
- New messages don't appear
- Need to refresh to see messages
- WebSocket events not firing

**Solutions:**
1. Check WebSocket connection:
   - Open browser DevTools → Network
   - Verify Socket.IO connection is active

2. Check backend event listeners:
   - Verify `messages.upsert` handler is registered
   - Check logs for received messages

3. Restart backend to re-establish connection

4. Check message sync settings on phone

### Issue: Messages show as "[Media message]"

**Symptoms:**
- Can't view images, videos, or files
- Only see placeholder text

**Solutions:**
1. This is expected behavior - media handling not fully implemented

2. To add media support, implement:
   - Download media from messages
   - Serve media files through backend
   - Display in frontend

3. Current implementation focuses on text messages

### Issue: Old messages not loading

**Symptoms:**
- Only recent messages appear
- Message history missing

**Solutions:**
1. Increase message fetch limit:
   ```javascript
   // In backend
   const limit = parseInt(req.query.limit) || 100; // increase from 50
   ```

2. Implement pagination:
   - Add "Load more" button
   - Fetch older messages on demand

3. Note: Baileys has limitations on fetching old messages:
   - May need to sync messages gradually
   - Some very old messages might not be available

## General Debugging Tips

### Enable Verbose Logging

Backend (`server.js`):
```javascript
const logger = pino({ level: 'debug' }); // change from 'silent'
```

Frontend (browser console):
```javascript
localStorage.setItem('debug', '*');
location.reload();
```

### Check Backend Health

```bash
# Server status
curl http://localhost:3000/

# Auth status
curl http://localhost:3000/api/auth/status

# Chats (when authenticated)
curl http://localhost:3000/api/chats
```

### Inspect Network Traffic

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reproduce the issue
4. Check for failed requests
5. Look at request/response details

### Review Logs

Backend:
```bash
# If using PM2
pm2 logs whatsapp-backend

# If running directly
# Logs appear in terminal
```

Frontend:
- Open browser console (F12 → Console)
- Look for errors or warnings

### Test Components Independently

1. Test backend API without frontend:
   ```bash
   curl http://localhost:3000/api/auth/qr
   ```

2. Test frontend with a working backend

3. Isolate the problem to specific component

## Getting Help

If you've tried the solutions above and still have issues:

1. **Gather Information:**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - OS and version
   - Backend logs
   - Browser console errors
   - Steps to reproduce

2. **Check Documentation:**
   - README.md
   - BACKEND_DEPLOYMENT.md
   - FRONTEND_DEPLOYMENT.md

3. **Search for Similar Issues:**
   - Check GitHub Issues
   - Search Baileys documentation

4. **Open a New Issue:**
   - Provide all gathered information
   - Include error messages
   - Describe expected vs actual behavior
   - List steps you've already tried

## Preventive Measures

1. **Keep Dependencies Updated:**
   ```bash
   npm update
   ```

2. **Regular Backups:**
   ```bash
   tar -czf backup.tar.gz auth_info_baileys/
   ```

3. **Monitor Resources:**
   - Check disk space
   - Monitor memory usage
   - Watch for errors in logs

4. **Test After Changes:**
   - Test locally before deploying
   - Verify all features work
   - Check on different devices

5. **Use Version Control:**
   - Commit working versions
   - Tag releases
   - Document changes
