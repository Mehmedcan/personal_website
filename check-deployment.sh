#!/bin/bash

# Quick deployment check script
# Bu scripti DigitalOcean droplet'inizde çalıştırarak her şeyin çalışıp çalışmadığını kontrol edebilirsiniz

echo "🔍 mehmedcan.com Deployment Durumu Kontrolü"
echo "=========================================="
echo ""

# System info
echo "📊 Sistem Bilgileri:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Hostname: $(hostname)"
echo "  IP: $(curl -s ifconfig.me)"
echo ""

# Check if required software is installed
echo "✅ Kurulu Yazılımlar:"
command -v node >/dev/null 2>&1 && echo "  ✓ Node.js: $(node --version)" || echo "  ✗ Node.js YOK"
command -v npm >/dev/null 2>&1 && echo "  ✓ NPM: $(npm --version)" || echo "  ✗ NPM YOK"
command -v nginx >/dev/null 2>&1 && echo "  ✓ Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)" || echo "  ✗ Nginx YOK"
command -v git >/dev/null 2>&1 && echo "  ✓ Git: $(git --version | cut -d' ' -f3)" || echo "  ✗ Git YOK"
command -v certbot >/dev/null 2>&1 && echo "  ✓ Certbot: $(certbot --version 2>&1 | cut -d' ' -f2)" || echo "  ✗ Certbot YOK"
echo ""

# Check Nginx status
echo "🌐 Nginx Durumu:"
if systemctl is-active --quiet nginx; then
    echo "  ✓ Nginx çalışıyor"
else
    echo "  ✗ Nginx çalışmıyor!"
fi

if sudo nginx -t >/dev/null 2>&1; then
    echo "  ✓ Nginx konfigürasyonu geçerli"
else
    echo "  ✗ Nginx konfigürasyonu HATALI!"
    sudo nginx -t
fi
echo ""

# Check web directory
echo "📁 Web Dizini:"
if [ -d "/var/www/mehmedcan.com" ]; then
    echo "  ✓ /var/www/mehmedcan.com mevcut"
    echo "  📄 Dosya sayısı: $(find /var/www/mehmedcan.com -type f | wc -l)"
    echo "  💾 Boyut: $(du -sh /var/www/mehmedcan.com | cut -f1)"
    
    if [ -f "/var/www/mehmedcan.com/index.html" ]; then
        echo "  ✓ index.html mevcut"
    else
        echo "  ⚠️  index.html YOK!"
    fi
else
    echo "  ✗ /var/www/mehmedcan.com YOK!"
fi
echo ""

# Check Nginx site config
echo "⚙️  Nginx Site Konfigürasyonu:"
if [ -f "/etc/nginx/sites-available/mehmedcan.com" ]; then
    echo "  ✓ /etc/nginx/sites-available/mehmedcan.com mevcut"
else
    echo "  ✗ /etc/nginx/sites-available/mehmedcan.com YOK!"
fi

if [ -L "/etc/nginx/sites-enabled/mehmedcan.com" ]; then
    echo "  ✓ Site enabled"
else
    echo "  ✗ Site ENABLED değil!"
fi
echo ""

# Check SSL
echo "🔒 SSL Sertifikası:"
if [ -d "/etc/letsencrypt/live/mehmedcan.com" ]; then
    echo "  ✓ SSL sertifikası mevcut"
    CERT_EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/mehmedcan.com/fullchain.pem | cut -d= -f2)
    echo "  📅 Son kullanma: $CERT_EXPIRY"
else
    echo "  ⚠️  SSL sertifikası YOK - certbot çalıştırmanız gerekiyor!"
fi
echo ""

# Check firewall
echo "🔥 Firewall (UFW):"
if command -v ufw >/dev/null 2>&1; then
    echo "  ✓ UFW kurulu"
    sudo ufw status | head -n 10
else
    echo "  ✗ UFW YOK"
fi
echo ""

# Check DNS
echo "🌍 DNS Kontrolü:"
DOMAIN_IP=$(dig +short mehmedcan.com @8.8.8.8 | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" == "$SERVER_IP" ]; then
    echo "  ✓ DNS doğru yapılandırılmış"
    echo "  📍 mehmedcan.com → $DOMAIN_IP"
else
    echo "  ⚠️  DNS yapılandırması kontrol edilmeli"
    echo "  📍 mehmedcan.com → $DOMAIN_IP"
    echo "  📍 Server IP → $SERVER_IP"
fi

WWW_IP=$(dig +short www.mehmedcan.com @8.8.8.8 | tail -n1)
if [ "$WWW_IP" == "$SERVER_IP" ]; then
    echo "  ✓ www.mehmedcan.com DNS doğru"
else
    echo "  ⚠️  www.mehmedcan.com DNS kontrol edilmeli"
fi
echo ""

# Check ports
echo "🔌 Port Kontrolü:"
if sudo netstat -tuln 2>/dev/null | grep -q ":80 "; then
    echo "  ✓ Port 80 (HTTP) dinleniyor"
else
    echo "  ✗ Port 80 kapalı!"
fi

if sudo netstat -tuln 2>/dev/null | grep -q ":443 "; then
    echo "  ✓ Port 443 (HTTPS) dinleniyor"
else
    echo "  ⚠️  Port 443 kapalı (SSL kurulumundan sonra açılacak)"
fi
echo ""

# Check recent logs
echo "📋 Son Nginx Logları (son 5 satır):"
if [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -n 5 /var/log/nginx/error.log
else
    echo "  ℹ️  Henüz log yok"
fi
echo ""

# Summary
echo "=========================================="
echo "🎯 ÖZET"
echo "=========================================="
echo ""
echo "Tarayıcıda test edin:"
echo "  http://mehmedcan.com"
echo "  http://www.mehmedcan.com"
echo ""
echo "SSL kurulumu yaptıysanız:"
echo "  https://mehmedcan.com"
echo "  https://www.mehmedcan.com"
echo ""
echo "Sorun mu var? Şu komutlarla detaylı kontrol yapın:"
echo "  sudo systemctl status nginx"
echo "  sudo tail -f /var/log/nginx/error.log"
echo "  sudo nginx -t"
echo ""

