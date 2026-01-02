#!/bin/bash

# Deployment script for mehmedcan.com
# Run this script on your DigitalOcean droplet

set -e

echo "🚀 Starting deployment setup for mehmedcan.com..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create web directory
echo "📁 Creating web directory..."
sudo mkdir -p /var/www/mehmedcan.com
sudo chown -R $USER:$USER /var/www/mehmedcan.com
sudo chmod -R 755 /var/www/mehmedcan.com

# Create Nginx configuration
echo "⚙️  Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/mehmedcan.com > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name mehmedcan.com www.mehmedcan.com;
    
    root /var/www/mehmedcan.com;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable site
echo "🔗 Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/mehmedcan.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx
sudo systemctl enable nginx

# Setup firewall
echo "🔥 Setting up firewall..."
sudo apt install -y ufw
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run this command to get SSL certificate:"
echo "   sudo certbot --nginx -d mehmedcan.com -d www.mehmedcan.com"
echo ""
echo "2. Your Droplet IP: $(curl -s ifconfig.me)"
echo ""
echo "3. Add this IP to your GoDaddy DNS settings:"
echo "   - A Record: @ → $(curl -s ifconfig.me)"
echo "   - A Record: www → $(curl -s ifconfig.me)"
echo ""
echo "4. Create SSH key for GitHub Actions:"
echo "   ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/github_actions"
echo "   cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys"
echo "   cat ~/.ssh/github_actions  # Copy this to GitHub Secrets as DO_SSH_KEY"
echo ""

