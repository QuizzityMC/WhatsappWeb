# Backend Deployment Guide

This guide covers detailed instructions for deploying the WhatsApp Web backend to various hosting platforms.

## Table of Contents

1. [Local Development](#local-development)
2. [VPS Deployment](#vps-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Heroku Deployment](#heroku-deployment)
5. [Railway Deployment](#railway-deployment)

## Local Development

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

### Testing

Test the API endpoints:

```bash
# Check server status
curl http://localhost:3000/

# Get authentication status
curl http://localhost:3000/api/auth/status

# Get QR code
curl http://localhost:3000/api/auth/qr
```

## VPS Deployment

### Prerequisites

- Ubuntu 20.04 or later (or similar Linux distribution)
- Root or sudo access
- Domain name (optional but recommended)

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install Git

```bash
sudo apt install git -y
```

### Step 4: Clone Repository

```bash
cd /home
git clone <your-repo-url>
cd WhatsappWeb/backend
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Install PM2

PM2 is a process manager for Node.js applications:

```bash
sudo npm install -g pm2
```

### Step 7: Start Application

```bash
pm2 start server.js --name whatsapp-backend
```

### Step 8: Configure PM2 Startup

```bash
pm2 startup
# Follow the instructions provided by the command
pm2 save
```

### Step 9: Configure Firewall

```bash
sudo ufw allow 3000
sudo ufw allow OpenSSH
sudo ufw enable
```

### Step 10: Setup Nginx Reverse Proxy (Optional)

Install Nginx:

```bash
sudo apt install nginx -y
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/whatsapp-backend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 11: Setup SSL with Let's Encrypt (Optional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Useful PM2 Commands

```bash
# View logs
pm2 logs whatsapp-backend

# Restart application
pm2 restart whatsapp-backend

# Stop application
pm2 stop whatsapp-backend

# View application status
pm2 status

# Monitor applications
pm2 monit
```

## Docker Deployment

### Step 1: Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

Create `backend/.dockerignore`:

```
node_modules
npm-debug.log
.env
auth_info_baileys
*.log
```

### Step 3: Build Docker Image

```bash
cd backend
docker build -t whatsapp-backend .
```

### Step 4: Run Docker Container

```bash
docker run -d \
  --name whatsapp-backend \
  -p 3000:3000 \
  -v $(pwd)/auth_info_baileys:/app/auth_info_baileys \
  whatsapp-backend
```

### Step 5: View Logs

```bash
docker logs -f whatsapp-backend
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/auth_info_baileys:/app/auth_info_baileys
    restart: unless-stopped
    environment:
      - PORT=3000
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Heroku Deployment

### Prerequisites

- Heroku account
- Heroku CLI installed

### Step 1: Login to Heroku

```bash
heroku login
```

### Step 2: Create Heroku App

```bash
cd backend
heroku create your-app-name
```

### Step 3: Create Procfile

Create `backend/Procfile`:

```
web: node server.js
```

### Step 4: Deploy

```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Step 5: Open Application

```bash
heroku open
```

### Note on Session Persistence

Heroku's ephemeral filesystem means session data will be lost on dyno restart. Consider using:
- Heroku Postgres addon for session storage
- External storage solution (S3, etc.)

## Railway Deployment

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
cd backend
railway init
```

### Step 4: Deploy

```bash
railway up
```

### Step 5: Add Domain (Optional)

```bash
railway domain
```

## Environment Variables

For production deployments, consider adding these environment variables:

```
PORT=3000
NODE_ENV=production
```

Set them based on your platform:

**VPS with PM2:**
```bash
pm2 start server.js --name whatsapp-backend --env production
```

**Docker:**
```bash
docker run -e NODE_ENV=production -e PORT=3000 ...
```

**Heroku:**
```bash
heroku config:set NODE_ENV=production
```

## Monitoring and Maintenance

### Log Management

For VPS deployments, consider setting up log rotation:

```bash
sudo nano /etc/logrotate.d/whatsapp-backend
```

Add:

```
/home/WhatsappWeb/backend/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### Backup Session Data

Regularly backup the `auth_info_baileys` folder:

```bash
# Create backup
tar -czf auth_backup_$(date +%Y%m%d).tar.gz auth_info_baileys/

# Restore backup
tar -xzf auth_backup_20240101.tar.gz
```

### Update Application

```bash
cd /home/WhatsappWeb
git pull
cd backend
npm install
pm2 restart whatsapp-backend
```

## Security Best Practices

1. **Use HTTPS:** Always use SSL/TLS in production
2. **Firewall:** Only expose necessary ports
3. **Regular Updates:** Keep Node.js and dependencies updated
4. **Environment Variables:** Never commit sensitive data
5. **Rate Limiting:** Implement rate limiting on APIs
6. **Authentication:** Add authentication layer for API access

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill the process
sudo kill -9 <PID>
```

### PM2 Process Not Starting

```bash
# View detailed logs
pm2 logs whatsapp-backend --lines 100

# Reset PM2
pm2 delete all
pm2 start server.js --name whatsapp-backend
```

### Docker Container Won't Start

```bash
# Check container logs
docker logs whatsapp-backend

# Inspect container
docker inspect whatsapp-backend
```

### Connection Issues

1. Check firewall settings
2. Verify port forwarding
3. Check application logs
4. Test with curl from server
5. Verify DNS settings

## Support

For deployment-specific issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify all dependencies are installed
4. Test locally first before deploying
