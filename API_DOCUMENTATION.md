# API Documentation

Complete API reference for the WhatsApp Web Alternative backend.

## Base URL

```
http://localhost:3000
```

Replace with your deployed backend URL in production.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication Endpoints

### Get Server Status

Check if the server is running.

**Endpoint:** `GET /`

**Response:**
```json
{
  "status": "online",
  "message": "WhatsApp Web Backend API",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl http://localhost:3000/
```

---

### Get QR Code

Get the QR code for WhatsApp authentication.

**Endpoint:** `GET /api/auth/qr`

**Response:**
```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Already authenticated or QR not ready"
}
```

**Example:**
```bash
curl http://localhost:3000/api/auth/qr
```

**Notes:**
- QR code is returned as a data URL
- Can be directly used as `src` attribute in `<img>` tag
- QR code is only available when not authenticated
- Expires after a short time (need to request new one)

---

### Get Authentication Status

Get the current authentication and connection status.

**Endpoint:** `GET /api/auth/status`

**Response:**
```json
{
  "success": true,
  "status": {
    "status": "connected",
    "user": {
      "id": "1234567890@s.whatsapp.net",
      "name": "User Name"
    }
  }
}
```

**Status Values:**
- `connected` - Authenticated and connected to WhatsApp
- `connecting` - Attempting to connect
- `disconnected` - Not authenticated or connection lost
- `error` - Connection error occurred

**Example:**
```bash
curl http://localhost:3000/api/auth/status
```

---

### Logout

Logout from WhatsApp and clear session.

**Endpoint:** `POST /api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

**Notes:**
- Clears all authentication data
- Requires re-authentication with QR code
- Cannot be undone

---

## Chat Endpoints

### Get All Chats

Retrieve all available chats.

**Endpoint:** `GET /api/chats`

**Response:**
```json
{
  "success": true,
  "chats": [
    {
      "id": "1234567890@s.whatsapp.net",
      "name": "Contact Name",
      "conversationTimestamp": 1234567890,
      "unreadCount": 5
    },
    {
      "id": "1234567890@g.us",
      "name": "Group Name",
      "conversationTimestamp": 1234567880,
      "unreadCount": 0
    }
  ]
}
```

**Chat Object:**
- `id` (string) - Unique chat identifier
- `name` (string) - Chat display name
- `conversationTimestamp` (number) - Last message timestamp
- `unreadCount` (number) - Number of unread messages

**Chat ID Formats:**
- Individual: `{phone}@s.whatsapp.net`
- Group: `{group_id}@g.us`

**Example:**
```bash
curl http://localhost:3000/api/chats
```

**Notes:**
- Requires authentication
- Returns empty array if not connected
- Chats are sorted by last message timestamp

---

### Get Messages from Chat

Retrieve messages from a specific chat.

**Endpoint:** `GET /api/chats/:chatId/messages`

**Parameters:**
- `chatId` (path, required) - The chat ID
- `limit` (query, optional) - Number of messages (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "key": {
        "remoteJid": "1234567890@s.whatsapp.net",
        "fromMe": false,
        "id": "message_id"
      },
      "message": {
        "conversation": "Hello, how are you?"
      },
      "messageTimestamp": 1234567890
    }
  ]
}
```

**Message Object:**
- `key` - Message identifier
  - `remoteJid` - Chat ID
  - `fromMe` - Whether message was sent by you
  - `id` - Unique message ID
- `message` - Message content
  - `conversation` - Text message content
  - `extendedTextMessage` - Extended text with formatting
  - `imageMessage` - Image message (not fully supported)
  - `videoMessage` - Video message (not fully supported)
  - `documentMessage` - Document message (not fully supported)
- `messageTimestamp` - Unix timestamp

**Example:**
```bash
curl "http://localhost:3000/api/chats/1234567890@s.whatsapp.net/messages?limit=50"
```

**Notes:**
- Chat ID must be URL encoded
- Messages are returned in chronological order
- Limit parameter controls number of messages
- Some old messages might not be available

---

## Message Endpoints

### Send Message

Send a text message to a chat.

**Endpoint:** `POST /api/messages/send`

**Request Body:**
```json
{
  "chatId": "1234567890@s.whatsapp.net",
  "message": "Hello, this is a test message",
  "type": "text"
}
```

**Parameters:**
- `chatId` (required) - The recipient chat ID
- `message` (required) - The message text
- `type` (optional) - Message type (default: "text")

**Response:**
```json
{
  "success": true,
  "result": {
    "status": 1,
    "messageID": "message_id"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "1234567890@s.whatsapp.net",
    "message": "Hello World",
    "type": "text"
  }'
```

**Error Response:**
```json
{
  "success": false,
  "error": "chatId and message are required"
}
```

**Notes:**
- Requires authentication
- Only text messages supported currently
- Chat ID must be valid and reachable
- Returns error if chat doesn't exist or can't send

---

## Contact Endpoints

### Get All Contacts

Retrieve all contacts.

**Endpoint:** `GET /api/contacts`

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "1234567890@s.whatsapp.net",
      "name": "Contact Name",
      "notify": "Display Name"
    }
  ]
}
```

**Contact Object:**
- `id` (string) - Contact ID (phone@s.whatsapp.net)
- `name` (string) - Contact name
- `notify` (string) - Display name set by contact

**Example:**
```bash
curl http://localhost:3000/api/contacts
```

**Notes:**
- Requires authentication
- Includes all contacts synced from phone
- Returns empty array if not connected

---

## Group Endpoints

### Get All Groups

Retrieve all groups.

**Endpoint:** `GET /api/groups`

**Response:**
```json
{
  "success": true,
  "groups": [
    {
      "id": "1234567890@g.us",
      "name": "Group Name",
      "participantsCount": 15
    }
  ]
}
```

**Group Object:**
- `id` (string) - Group ID (group_id@g.us)
- `name` (string) - Group name
- `participantsCount` (number) - Number of participants

**Example:**
```bash
curl http://localhost:3000/api/groups
```

**Notes:**
- Requires authentication
- Only includes groups you're a member of
- Returns empty array if not connected

---

## WebSocket Events

The backend uses Socket.IO for real-time updates.

### Connection

**Client connects:**
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

### QR Code Event

Emitted when a new QR code is generated.

**Event:** `qr`

**Data:**
```json
{
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Example:**
```javascript
socket.on('qr', (data) => {
  console.log('QR Code received:', data.qr);
  // Display QR code in UI
});
```

---

### Connection Status Event

Emitted when connection status changes.

**Event:** `connection-status`

**Data:**
```json
{
  "status": "connected"
}
```

**Status Values:**
- `connected` - Connected to WhatsApp
- `connecting` - Attempting connection
- `disconnected` - Not connected

**Example:**
```javascript
socket.on('connection-status', (data) => {
  console.log('Status:', data.status);
  // Update UI based on status
});
```

---

### New Message Event

Emitted when a new message is received.

**Event:** `new-message`

**Data:**
```json
{
  "chatId": "1234567890@s.whatsapp.net",
  "message": { ... },
  "timestamp": 1234567890
}
```

**Example:**
```javascript
socket.on('new-message', (data) => {
  console.log('New message in chat:', data.chatId);
  // Update chat UI with new message
});
```

---

### Chats Update Event

Emitted when chats are updated.

**Event:** `chats-update`

**Data:**
```json
{
  "chats": [ ... ]
}
```

**Example:**
```javascript
socket.on('chats-update', (data) => {
  console.log('Chats updated:', data.chats.length);
  // Refresh chats list
});
```

---

### Contacts Update Event

Emitted when contacts are updated.

**Event:** `contacts-update`

**Data:**
```json
{
  "contacts": [ ... ]
}
```

**Example:**
```javascript
socket.on('contacts-update', (data) => {
  console.log('Contacts updated:', data.contacts.length);
  // Refresh contacts list
});
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing required parameters)
- `500` - Internal Server Error

### Common Errors

**Not Connected:**
```json
{
  "success": false,
  "error": "WhatsApp not connected"
}
```

**Invalid Parameters:**
```json
{
  "success": false,
  "error": "chatId and message are required"
}
```

**Internal Error:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CORS

CORS is enabled for all origins by default. For production, restrict to specific origins:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

---

## Testing the API

### Using cURL

```bash
# Check server status
curl http://localhost:3000/

# Get auth status
curl http://localhost:3000/api/auth/status

# Get chats
curl http://localhost:3000/api/chats

# Send message
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"chatId":"1234567890@s.whatsapp.net","message":"test"}'
```

### Using JavaScript (Fetch)

```javascript
// Get chats
fetch('http://localhost:3000/api/chats')
  .then(res => res.json())
  .then(data => console.log(data));

// Send message
fetch('http://localhost:3000/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatId: '1234567890@s.whatsapp.net',
    message: 'Hello from API'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Using Postman

1. Import the endpoints into Postman
2. Set base URL to `http://localhost:3000`
3. Add `Content-Type: application/json` header for POST requests
4. Test each endpoint

---

## Best Practices

1. **Always check connection status** before sending messages
2. **Handle WebSocket disconnections** and reconnect automatically
3. **Validate chat IDs** before sending messages
4. **Store credentials securely** on the server
5. **Implement authentication** for API access in production
6. **Add rate limiting** to prevent abuse
7. **Use HTTPS** in production
8. **Log errors** for debugging
9. **Monitor server health** and performance
10. **Keep dependencies updated** for security

---

## Future Enhancements

Planned features for future versions:

- [ ] Media message support (images, videos, documents)
- [ ] Group management (create, add/remove members)
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Voice messages
- [ ] Message search
- [ ] User profile management
- [ ] Broadcast lists
- [ ] Message reactions
- [ ] Forward messages
- [ ] Delete messages
- [ ] Star messages
- [ ] Archive chats

---

## Support

For API-related issues:
1. Check this documentation
2. Review server logs
3. Test endpoints with cURL
4. Check CORS configuration
5. Verify authentication status
6. Open an issue on GitHub with details
