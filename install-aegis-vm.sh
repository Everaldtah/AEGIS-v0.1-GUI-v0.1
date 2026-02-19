#!/bin/bash
# AEGIS Studio VM Installation Script
# Run inside Ubuntu/Debian chroot or on fresh install

set -e

echo "Installing AEGIS Studio..."

# Update packages
export DEBIAN_FRONTEND=noninteractive
apt-get update

# Install basic dependencies
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    nginx \
    supervisor

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"

# Create aegis user
useradd -m -s /bin/bash aegis || true
echo "aegis:aegisstudio" | chpasswd

# Create app directory
mkdir -p /opt/aegis-studio
chown aegis:aegis /opt/aegis-studio

# Switch to aegis user for installation
su - aegis -c "
    # Clone AEGIS repositories
    cd /opt/aegis-studio

    # Clone and build AEGIS v0.1
    if [ ! -d 'AEGIS VERSION 2.0' ]; then
        git clone https://github.com/Everaldtah/AEGIS-v0.1-Safe-Security-Research-Sandbox.git 'AEGIS VERSION 2.0' || true
    fi

    if [ -d 'AEGIS VERSION 2.0' ]; then
        cd 'AEGIS VERSION 2.0'
        source \$HOME/.cargo/env
        cargo build --release
    fi

    # Clone and build AEGIS Studio GUI
    if [ ! -d 'AEGIS-v0.1-GUI-v0.1' ]; then
        git clone https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1.git
    fi

    if [ -d 'AEGIS-v0.1-GUI-v0.1' ]; then
        cd 'AEGIS-v0.1-GUI-v0.1/frontend'
        npm install
        npm run build
    fi
"

# Setup systemd services
cat > /etc/systemd/system/aegis-backend.service << 'EOF'
[Unit]
Description=AEGIS Studio Backend
After=network.target

[Service]
Type=simple
User=aegis
WorkingDirectory=/opt/aegis-studio/AEGIS-v0.1-GUI-v0.1/backend
Environment="PATH=/home/aegis/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/aegis/.cargo/bin/cargo run --release
Restart=always

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/aegis-frontend.service << 'EOF'
[Unit]
Description=AEGIS Studio Frontend
After=network.target aegis-backend.service

[Service]
Type=simple
User=aegis
WorkingDirectory=/opt/aegis-studio/AEGIS-v0.1-GUI-v0.1/frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Setup nginx reverse proxy
cat > /etc/nginx/sites-available/aegis-studio << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/aegis-studio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Enable services
systemctl enable aegis-backend.service
systemctl enable aegis-frontend.service
systemctl enable nginx

# Configure firewall
ufw allow 80/tcp
ufw allow 443/tcp

# Create startup script
cat > /usr/local/bin/aegis-studio-info << 'EOF'
#!/bin/bash
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     AEGIS Studio v0.1.0                                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
IP=$(hostname -I | awk '{print $1}')
echo "Web UI: http://$IP"
echo ""
echo "Services:"
systemctl status aegis-backend.service --no-pager -l | grep "Active:"
systemctl status aegis-frontend.service --no-pager -l | grep "Active:"
systemctl status nginx.service --no-pager -l | grep "Active:"
echo ""
echo "Logs:"
echo "  Backend: sudo journalctl -u aegis-backend -f"
echo "  Frontend: sudo journalctl -u aegis-frontend -f"
echo "  Nginx: sudo journalctl -u nginx -f"
EOF

chmod +x /usr/local/bin/aegis-studio-info

# Add to bashrc for auto-display on login
cat >> /etc/bash.bashrc << 'EOF'

# AEGIS Studio Info
if [ -z "$SSH_CONNECTION" ]; then
    aegis-studio-info
fi
EOF

echo "AEGIS Studio installation complete!"
