# Frontend Deployment Guide

This guide covers deploying the WhatsApp Web frontend to GitHub Pages and other static hosting platforms.

## Table of Contents

1. [GitHub Pages Deployment](#github-pages-deployment)
2. [Netlify Deployment](#netlify-deployment)
3. [Vercel Deployment](#vercel-deployment)
4. [Custom Configuration](#custom-configuration)

## GitHub Pages Deployment

### Method 1: Using Repository Settings (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add frontend files"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select your branch (usually `main` or `master`)
   - Select folder: either `/ (root)` or `/docs`
   - If you selected root, your frontend will be at `https://[username].github.io/[repo]/frontend/`
   - Click "Save"

3. **Wait for deployment:**
   - GitHub will build and deploy your site
   - Check the "Actions" tab to monitor the deployment
   - Once complete, your site will be live

4. **Update backend URL:**
   - Open your live frontend in a browser
   - Update the backend URL to point to your deployed backend server
   - The URL will be saved in browser's localStorage

### Method 2: Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
```

### Custom Domain Setup

If you want to use a custom domain:

1. **Add CNAME file:**
   Create `frontend/CNAME` with your domain:
   ```
   yourdomain.com
   ```

2. **Configure DNS:**
   Add these records to your domain's DNS:
   ```
   Type    Name    Value
   A       @       185.199.108.153
   A       @       185.199.109.153
   A       @       185.199.110.153
   A       @       185.199.111.153
   ```

3. **Enable HTTPS:**
   - In GitHub Pages settings
   - Check "Enforce HTTPS"

## Netlify Deployment

### Method 1: Drag and Drop

1. Go to [Netlify](https://netlify.com)
2. Sign up or log in
3. Drag and drop the `frontend` folder
4. Your site will be deployed instantly

### Method 2: Git Integration

1. **Connect your repository:**
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository

2. **Configure build settings:**
   - Base directory: `frontend`
   - Build command: (leave empty)
   - Publish directory: `.` or `/`

3. **Deploy:**
   - Click "Deploy site"
   - Netlify will assign you a URL like `https://[random-name].netlify.app`

4. **Custom domain (optional):**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow the instructions

### Method 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd frontend
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Vercel Deployment

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

### Method 2: Git Integration

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Other
   - Root Directory: `frontend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Click "Deploy"

## Custom Configuration

### Configure Backend URL

There are several ways to configure the backend URL:

#### Option 1: Use localStorage (Current Implementation)

The frontend stores the backend URL in localStorage. Users can change it through the UI.

#### Option 2: Use a Configuration File

Create `frontend/config.js`:

```javascript
const config = {
  backendUrl: 'https://your-backend-url.com'
};
```

Then update `frontend/app.js` to use this config:

```javascript
constructor() {
  this.backendUrl = config.backendUrl || localStorage.getItem('backendUrl') || 'http://localhost:3000';
  // ... rest of the code
}
```

Don't forget to include the config file in `index.html`:

```html
<script src="config.js"></script>
<script src="app.js"></script>
```

#### Option 3: Environment Variables (Advanced)

If you're using a build process, you can use environment variables:

1. **Create `.env` file:**
   ```
   BACKEND_URL=https://your-backend-url.com
   ```

2. **Use a bundler like Webpack or Vite:**
   This requires setting up a build process, which goes against the "stateless" design but provides better configuration management.

### CORS Configuration

Make sure your backend allows requests from your frontend domain:

Update `backend/server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourusername.github.io',
  'https://your-custom-domain.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});
```

## Testing Your Deployment

After deployment, test the following:

1. **Frontend loads correctly:**
   - Visit your deployed URL
   - Check browser console for errors

2. **Backend connection:**
   - Enter your backend URL
   - Click "Connect"
   - Verify connection status

3. **QR code display:**
   - QR code should appear
   - Try scanning with WhatsApp

4. **Functionality:**
   - Test login process
   - Test sending messages
   - Test receiving messages

## Optimization Tips

### 1. Enable Caching

Add cache headers to your static files. For GitHub Pages, create a `_headers` file:

```
/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable
```

### 2. Minify Assets

Before deploying, minify your CSS and JavaScript:

```bash
# Install terser for JS minification
npm install -g terser

# Minify JavaScript
terser frontend/app.js -o frontend/app.min.js -c -m

# Update index.html to use minified version
```

### 3. Optimize Images

If you add custom images:
- Use WebP format
- Compress images
- Use appropriate sizes

### 4. Use CDN for Libraries

The frontend already uses CDN for Socket.IO. This is good practice:

```html
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
```

## Troubleshooting

### Issue: CORS Errors

**Solution:**
1. Check backend CORS configuration
2. Ensure frontend domain is whitelisted
3. Check browser console for specific error

### Issue: Connection Failed

**Solution:**
1. Verify backend URL is correct
2. Check if backend is running
3. Test backend API directly with curl
4. Check network tab in browser DevTools

### Issue: Socket.IO Not Connecting

**Solution:**
1. Verify Socket.IO CDN is loading
2. Check backend Socket.IO configuration
3. Ensure WebSocket is not blocked by firewall
4. Try using polling transport as fallback

### Issue: GitHub Pages 404

**Solution:**
1. Check if GitHub Pages is enabled
2. Verify correct branch is selected
3. Wait a few minutes for deployment
4. Clear browser cache

### Issue: Mixed Content (HTTP/HTTPS)

**Solution:**
1. Use HTTPS for backend if frontend is HTTPS
2. Or configure frontend to use HTTP (not recommended)
3. Check browser console for mixed content warnings

## Monitoring

### Analytics

Add Google Analytics or similar:

```html
<!-- Add to head section of index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Consider adding error tracking:

```javascript
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, 'at', url, lineNo, columnNo);
  // Send to your error tracking service
  return false;
};
```

## Updating Your Deployment

### GitHub Pages

Simply push your changes:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

GitHub Actions will automatically redeploy.

### Netlify

Push to your Git repository, or use CLI:

```bash
netlify deploy --prod
```

### Vercel

Push to Git or use CLI:

```bash
vercel --prod
```

## Best Practices

1. **Always use HTTPS in production**
2. **Keep backend URL configurable**
3. **Test on multiple devices and browsers**
4. **Monitor error logs**
5. **Keep dependencies updated**
6. **Use semantic versioning for releases**
7. **Document configuration changes**

## Security Considerations

1. **Never commit sensitive data:**
   - API keys
   - Secrets
   - Private tokens

2. **Content Security Policy:**
   Consider adding CSP headers for enhanced security.

3. **HTTPS only:**
   Always use HTTPS in production to protect data in transit.

4. **Regular updates:**
   Keep all dependencies updated for security patches.

## Support

For deployment issues:
1. Check the platform-specific documentation
2. Review browser console for errors
3. Test backend connectivity independently
4. Check hosting platform status page
5. Review this documentation carefully

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
