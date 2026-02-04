# Network Connectivity Guide

## Understanding the "Not Working" Issue

If you're seeing repeated "QR Code received" messages or connection errors, you're likely experiencing a **network connectivity issue**.

## The Problem

The backend needs to connect to WhatsApp's servers at `web.whatsapp.com` to function. If your environment cannot reach these servers, you'll see errors like:

```
❌ NETWORK ERROR: Cannot reach WhatsApp servers.
Connection closed: {
  statusCode: 408,
  error: 'WebSocket Error (getaddrinfo ENOTFOUND web.whatsapp.com)',
  shouldReconnect: true
}
```

## Quick Diagnosis

Before starting the backend, run the network checker:

```bash
cd backend
npm run check
```

### ✅ If the check passes:
```
✅ SUCCESS: web.whatsapp.com resolves to 157.240.x.x
✅ SUCCESS: Connected to WhatsApp (Status: 200)
✨ All checks passed! Your environment can reach WhatsApp servers.
```
→ You're good to go! Start the backend with `npm start`

### ❌ If the check fails:
```
❌ FAILED: Cannot resolve web.whatsapp.com
   Error: getaddrinfo ENOTFOUND web.whatsapp.com
```
→ Your environment **CANNOT** reach WhatsApp. See solutions below.

## Why This Happens

### Common Environments with Blocked Access:

1. **GitHub Codespaces**
   - Intentionally blocks WhatsApp/social media
   - No workaround available within Codespaces

2. **Cloud IDEs (Replit, Gitpod, etc.)**
   - May have network restrictions
   - Check their documentation for firewall rules

3. **Corporate/School Networks**
   - Often block social media sites including WhatsApp
   - Network administrators enforce these restrictions

4. **Some VPS Providers**
   - May block certain services
   - Check provider's acceptable use policy

5. **Countries with Internet Restrictions**
   - Some countries block WhatsApp at the ISP level
   - VPN might be required (check local laws)

## Solutions

### ✅ Recommended: Deploy on Unrestricted Environment

**Best Options:**

1. **Local Computer**
   - Run on your personal laptop/desktop
   - Most reliable option for development
   ```bash
   # On your local machine
   git clone <repo-url>
   cd WhatsappWeb/backend
   npm install
   npm run check  # Should pass
   npm start
   ```

2. **Personal VPS**
   - DigitalOcean, Linode, Vultr, etc.
   - Choose a provider that doesn't block WhatsApp
   - Most standard VPS providers allow this
   ```bash
   # On your VPS
   sudo apt update
   sudo apt install nodejs npm git
   git clone <repo-url>
   cd WhatsappWeb/backend
   npm install
   npm run check  # Should pass
   npm start
   ```

3. **Home Server/Raspberry Pi**
   - If you have a home server or Raspberry Pi
   - Connect to home network (not corporate/school)

### Alternative: Mobile Hotspot

If you must use a restricted environment for development:

1. Connect your computer to mobile hotspot
2. Run the backend on your computer (not in Codespaces)
3. Ensure phone has good data connection

### What WON'T Work

❌ **Trying to bypass restrictions in Codespaces**
- Codespaces network policy is enforced at infrastructure level
- No configuration change will allow WhatsApp access

❌ **Using a proxy in the backend**
- WhatsApp uses WebSocket connections with certificate pinning
- Proxies typically don't work with WhatsApp's protocol

❌ **Changing DNS servers**
- The block is at the network level, not just DNS
- Won't help if the network blocks traffic to WhatsApp IPs

## Testing Your Environment

### Manual Tests

1. **Test DNS Resolution:**
   ```bash
   nslookup web.whatsapp.com
   # Should return IP addresses
   ```

2. **Test HTTP Connection:**
   ```bash
   curl -I https://web.whatsapp.com
   # Should return HTTP 200 or 302
   ```

3. **Test WebSocket (requires wscat):**
   ```bash
   npm install -g wscat
   wscat -c wss://web.whatsapp.com/ws
   # Should connect (will immediately disconnect, that's OK)
   ```

If ANY of these fail, your environment blocks WhatsApp.

## Frequently Asked Questions

### Q: Can I use this in GitHub Codespaces?
**A:** No. Codespaces blocks WhatsApp by design. You must deploy elsewhere.

### Q: Why does the backend keep reconnecting?
**A:** It's trying to reach WhatsApp servers but failing. After 10 attempts, it will stop.

### Q: Will a VPN help?
**A:** Maybe. If you're on a restricted network and can use VPN on your computer (not in Codespaces), it might work. But running locally or on a VPS is more reliable.

### Q: Can I modify the code to work around this?
**A:** No. The backend MUST connect to WhatsApp's servers. This is not a code issue but an infrastructure requirement.

### Q: What about using a different port?
**A:** The issue isn't the port the backend uses (3000). It's the outbound connection to WhatsApp's servers (port 443/5222). You can't change this.

### Q: Is there a mock/demo mode?
**A:** Not currently. The entire application requires an active WhatsApp connection. Without it, there's nothing to show.

## Deployment Checklist

Before deploying to production:

- [ ] Run `npm run check` on target server
- [ ] Verify all checks pass
- [ ] Test WhatsApp Web in a browser on the same server/network
- [ ] Ensure firewall allows outbound HTTPS (port 443)
- [ ] Check no corporate proxy blocks WhatsApp
- [ ] Verify continuous uptime requirements (server won't restart on network issues)

## Getting Help

If you've verified network access but still have issues:

1. Run `npm run check` and share the output
2. Share backend error logs
3. Specify your deployment environment
4. Describe your network setup (VPN, proxy, etc.)

## Summary

✅ **Works:** Local computer, personal VPS, home network, mobile hotspot
❌ **Doesn't Work:** GitHub Codespaces, restricted networks, some cloud IDEs

The issue is **NOT** with the code - it's with network access to WhatsApp servers. Deploy in an unrestricted environment for the application to function.
