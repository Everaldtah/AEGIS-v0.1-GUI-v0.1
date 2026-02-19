# AEGIS Studio - VM Deployment Guide

This guide explains how to run AEGIS Studio in a virtual machine.

## 🚀 Quick Start (3 Options)

### Option 1: Vagrant + VirtualBox (Easiest)

**Prerequisites:**
- VirtualBox installed
- Vagrant installed

**Steps:**
```bash
cd "AEGIS-v0.1 GUI"
vagrant up
```

**Access:**
- Web UI: http://localhost:5173
- VM: `vagrant ssh`

**Commands:**
```bash
vagrant up      # Start VM
vagrant halt    # Stop VM
vagrant reload  # Restart VM
vagrant ssh     # SSH into VM
```

---

### Option 2: Custom Ubuntu ISO

**Creates a bootable ISO with AEGIS Studio pre-installed**

**Steps:**

1. **On Linux/WSL, run:**
```bash
cd "AEGIS-v0.1 GUI"
chmod +x create-iso.sh
sudo ./create-iso.sh
```

2. **This creates:**
```
aegis-studio-0.1.0.amd64.iso
```

3. **Use in VirtualBox:**
   - Create new VM (Linux, Ubuntu 64-bit)
   - Mount ISO as CD/DVD
   - Start VM
   - Install AEGIS Studio

**VM Credentials:**
- Username: `aegis`
- Password: `aegisstudio`
- Web UI: http://VM_IP:5173

---

### Option 3: Manual Ubuntu VM Setup

**1. Create VM:**
- Download Ubuntu Server 24.04 ISO
- Create new VM in VirtualBox (4GB RAM, 2 CPUs, 20GB disk)
- Install Ubuntu

**2. After installation, SSH into VM:**
```bash
ssh ubuntu@vm-ip
```

**3. Run installation script:**
```bash
# Download script
wget https://raw.githubusercontent.com/Everaldtah/AEGIS-v0.1-GUI-v0.1/main/install-aegis-vm.sh

# Make executable
chmod +x install-aegis-vm.sh

# Run installation
sudo ./install-aegis-vm.sh
```

**4. Reboot and access:**
```bash
sudo reboot
```

Access at: http://VM_IP:5173

---

## 🔧 System Requirements

### Minimum:
- **RAM:** 4GB
- **CPUs:** 2
- **Disk:** 20GB
- **OS:** Ubuntu 24.04 / Debian 12+

### Recommended:
- **RAM:** 8GB
- **CPUs:** 4
- **Disk:** 50GB
- **OS:** Ubuntu 24.04 LTS

---

## 📁 VM Structure

```
/opt/aegis-studio/
├── AEGIS VERSION 2.0/          # AEGIS CLI tools
│   └── target/release/
│       ├── aegiscc
│       ├── aegis-sandbox
│       └── aegisfuzz
└── AEGIS-v0.1-GUI-v0.1/        # AEGIS Studio GUI
    ├── backend/                # Rust backend (runs on port 3000)
    └── frontend/               # React frontend (runs on port 5173)
```

---

## 🌐 Accessing AEGIS Studio

### From Host Machine:
```bash
# Vagrant option
http://localhost:5173

# Manual VM
http://<VM_IP>:5173
```

### Find VM IP:
```bash
# Inside VM
hostname -I

# From host
ping aegis-studio.local
```

---

## 🔍 Service Management

### Check services:
```bash
sudo systemctl status aegis-backend
sudo systemctl status aegis-frontend
sudo systemctl status nginx
```

### Restart services:
```bash
sudo systemctl restart aegis-backend
sudo systemctl restart aegis-frontend
sudo systemctl restart nginx
```

### View logs:
```bash
sudo journalctl -u aegis-backend -f
sudo journalctl -u aegis-frontend -f
sudo journalctl -u nginx -f
```

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
cd /opt/aegis-studio/AEGIS-v0.1-GUI-v0.1/backend
cargo build --release
sudo systemctl restart aegis-backend
```

### Frontend won't start:
```bash
cd /opt/aegis-studio/AEGIS-v0.1-GUI-v0.1/frontend
npm install
npm run build
sudo systemctl restart aegis-frontend
```

### Port conflicts:
```bash
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5173
```

### Firewall issues:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 3000/tcp
```

---

## 📊 Performance Tuning

### Increase VM resources:
```bash
# Vagrantfile
vb.memory = 8192      # 8GB RAM
vb.cpus = 4           # 4 CPUs
```

### Optimize backend:
```bash
# In backend Cargo.toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

---

## 🔄 Updates

### Update AEGIS Studio:
```bash
cd /opt/aegis-studio/AEGIS-v0.1-GUI-v0.1
git pull
cd backend && cargo build --release
cd ../frontend && npm install && npm run build
sudo systemctl restart aegis-backend aegis-frontend
```

---

## 📝 Notes

- **Default user:** `aegis` (ISO) or `vagrant` (Vagrant)
- **Default password:** `aegisstudio` or `vagrant`
- **Web UI:** Port 5173
- **API:** Port 3000
- **Logs:** `/var/log/journal/`

---

## 🆘 Support

- GitHub Issues: https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1/issues
- AEGIS Project: https://github.com/Everaldtah/AEGIS-v0.1-Safe-Security-Research-Sandbox

---

**Choose the option that best fits your needs:**
- **Beginner:** Option 1 (Vagrant)
- **Advanced:** Option 2 (Custom ISO)
- **Flexible:** Option 3 (Manual setup)
