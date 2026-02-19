# AEGIS Studio - VM Deployment Quick Start

## 🚀 Choose Your Deployment Method

### 1️⃣ Vagrant + VirtualBox (Recommended - 5 minutes)

**Best for:** Quick testing, development

```bash
cd "AEGIS-v0.1 GUI"
vagrant up
```

Access at: http://localhost:5173

---

### 2️⃣ Custom ISO (Production - 30 minutes)

**Best for:** Offline installation, multiple deployments

```bash
cd "AEGIS-v0.1 GUI"
sudo ./create-iso.sh
```

Creates: `aegis-studio-0.1.0.amd64.iso`

Use in VirtualBox/VMware/Hyper-V

---

### 3️⃣ Docker (Fastest - 2 minutes)

**Best for:** Containerized deployment

```bash
cd "AEGIS-v0.1 GUI"
docker-compose -f docker-compose.vm.yml up -d
```

Access at: http://localhost:5173

---

### 4️⃣ Manual Setup (Flexible)

**Best for:** Custom configurations

1. Create Ubuntu 24.04 VM
2. SSH in: `ssh ubuntu@vm-ip`
3. Run:
```bash
wget https://raw.githubusercontent.com/Everaldtah/AEGIS-v0.1-GUI-v0.1/main/install-aegis-vm.sh
sudo ./install-aegis-vm.sh
sudo reboot
```

---

## ✅ Verification

After deployment, open browser to:

```
http://localhost:5173
```

You should see:
- AEGIS Studio interface
- Code Lab with Monaco editor
- Sandbox Runner controls
- Fuzzing Console
- Security Timeline

---

## 📋 Requirements

| Method | RAM | CPUs | Disk | Software |
|--------|-----|------|------|----------|
| Vagrant | 4GB | 2 | 20GB | VirtualBox + Vagrant |
| ISO | 4GB | 2 | 20GB | VirtualBox/VMware |
| Docker | 4GB | 2 | 10GB | Docker + Compose |
| Manual | 4GB | 2 | 20GB | None (install in VM) |

---

## 🔧 Default Credentials

| Method | Username | Password |
|--------|----------|----------|
| Vagrant | vagrant | vagrant |
| ISO | aegis | aegisstudio |
| Manual | (your user) | (your pass) |

---

## 📊 Service Status

Check if services are running:

```bash
# SSH into VM
vagrant ssh  # or ssh user@vm-ip

# Check services
sudo systemctl status aegis-backend
sudo systemctl status aegis-frontend
sudo systemctl status nginx

# View info
aegis-studio-info
```

---

## 🐛 Troubleshooting

**Can't access web UI?**
```bash
# Check VM IP
hostname -I

# Check ports
sudo netstat -tlnp | grep -E ':3000|:5173|:80'

# Restart services
sudo systemctl restart aegis-backend aegis-frontend nginx
```

**Backend crashes?**
```bash
cd /opt/aegis-studio/AEGIS-v0.1-GUI-v0.1/backend
cargo build --release
sudo systemctl restart aegis-backend
```

**Out of memory?**
- Increase VM RAM to 8GB
- Check: `free -h`

---

## 📖 Full Documentation

See: [VM-SETUP.md](./VM-SETUP.md)

---

## 🆘 Support

- Issues: https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1/issues
- AEGIS: https://github.com/Everaldtah/AEGIS-v0.1-Safe-Security-Research-Sandbox

---

**Choose Vagrant for quickest results!** 🎯
