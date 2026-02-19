# Vagrantfile for AEGIS Studio
# Creates a ready-to-use VM with VirtualBox

Vagrant.configure("2") do |config|
  # Use Ubuntu 24.04 as base
  config.vm.box = "ubuntu/noble64"

  # Configure VM resources
  config.vm.provider "virtualbox" do |vb|
    vb.name = "AEGIS-Studio-v0.1.0"
    vb.memory = 4096
    vb.cpus = 2
    vb.gui = false
  end

  # Forward ports for web UI
  config.vm.network "forwarded_port", guest: 5173, host: 5173
  config.vm.network "forwarded_port", guest: 3000, host: 3000

  # Sync project folder
  config.vm.synced_folder ".", "/vagrant", disabled: true

  # Provisioning script
  config.vm.provision "shell", inline: <<-SHELL
    set -e

    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║     Installing AEGIS Studio...                              ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"

    # Update system
    export DEBIAN_FRONTEND=noninteractive
    apt-get update

    # Install dependencies
    apt-get install -y curl git build-essential pkg-config libssl-dev

    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs

    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    export PATH="$HOME/.cargo/bin:$PATH"

    # Install nginx
    apt-get install -y nginx

    # Clone AEGIS repositories
    cd /home/vagrant
    git clone https://github.com/Everaldtah/AEGIS-v0.1-Safe-Security-Research-Sandbox.git 'AEGIS VERSION 2.0' || true
    git clone https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1.git

    # Build AEGIS CLI tools
    if [ -d 'AEGIS VERSION 2.0' ]; then
      cd 'AEGIS VERSION 2.0'
      source $HOME/.cargo/env
      cargo build --release
    fi

    # Build AEGIS Studio GUI backend
    if [ -d 'AEGIS-v0.1-GUI-v0.1' ]; then
      cd 'AEGIS-v0.1-GUI-v0.1/backend'
      source $HOME/.cargo/env
      cargo build --release

      # Build frontend
      cd ../frontend
      npm install
      npm run build
    fi

    # Setup systemd services
    cat > /etc/systemd/system/aegis-backend.service << 'EOFSERVICE'
[Unit]
Description=AEGIS Studio Backend
After=network.target

[Service]
Type=simple
User=vagrant
WorkingDirectory=/home/vagrant/AEGIS-v0.1-GUI-v0.1/backend
Environment="PATH=/home/vagrant/.cargo/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/home/vagrant/.cargo/bin/cargo run --release
Restart=always

[Install]
WantedBy=multi-user.target
EOFSERVICE

    cat > /etc/systemd/system/aegis-frontend.service << 'EOFSERVICE'
[Unit]
Description=AEGIS Studio Frontend
After=network.target aegis-backend.service

[Service]
Type=simple
User=vagrant
WorkingDirectory=/home/vagrant/AEGIS-v0.1-GUI-v0.1/frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=always

[Install]
WantedBy=multi-user.target
EOFSERVICE

    # Setup nginx
    cat > /etc/nginx/sites-available/aegis-studio << 'EOFNGINX'
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
EOFNGINX

    ln -sf /etc/nginx/sites-available/aegis-studio /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Enable services
    systemctl enable aegis-backend.service
    systemctl enable aegis-frontend.service
    systemctl enable nginx
    systemctl start aegis-backend.service
    systemctl start aegis-frontend.service
    systemctl restart nginx

    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║     AEGIS Studio Installation Complete!                     ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Access AEGIS Studio at: http://localhost:5173"
    echo ""
    echo "VM credentials:"
    echo "  Username: vagrant"
    echo "  Password: vagrant"
  SHELL
end
