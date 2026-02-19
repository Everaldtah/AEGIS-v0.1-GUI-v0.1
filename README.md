# AEGIS Studio - GUI for AEGIS Security Research Platform

A modern web-based GUI for AEGIS - the safe security research sandbox.

![AEGIS Studio](https://img.shields.io/badge/version-0.1.0-blue)
![Rust](https://img.shields.io/badge/rust-1.93+-orange)
![React](https://img.shields.io/badge/react-18+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### 📝 Code Lab
- **Monaco Editor** - VS Code's editor in the browser
- Real-time AegisLang compilation
- AST visualization
- Policy validation results
- Bytecode inspection

### 🛡️ Sandbox Runner
- Visual sandbox configuration
- Memory limit slider (50MB - 1GB)
- Timeout controls (1s - 1min)
- Network isolation toggle
- Real-time resource usage graphs
- Syscall logging

### 🐛 Fuzzing Console
- Visual fuzzing dashboard
- Real-time coverage tracking
- Crash detection and reporting
- Corpus management
- Mutation statistics
- Execs/sec monitoring

### 📊 Security Timeline
- SIEM-style unified log view
- Compile-time policy events
- Sandbox violations
- Fuzz crashes
- Real-time event filtering

## 🛠️ Tech Stack

### Backend
- **Rust** with Axum web framework
- **Tokio** async runtime
- RESTful API

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Chart.js** for data visualization
- **Vite** for fast builds

## 📦 Installation

### Option 1: VM Deployment (Recommended for Testing)

#### Vagrant + VirtualBox (Easiest - 5 min)
```bash
git clone https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1.git
cd AEGIS-v0.1-GUI-v0.1
vagrant up
```
Access at: http://localhost:5173

#### Custom ISO
```bash
sudo ./create-iso.sh
# Creates bootable ISO: aegis-studio-0.1.0.amd64.iso
```

See [QUICKSTART-VM.md](./QUICKSTART-VM.md) for all VM options.

---

### Option 2: Local Development

#### Prerequisites
- Rust 1.93+
- Node.js 18+
- AEGIS v0.1 binaries (aegiscc, aegis-sandbox, aegisfuzz)

#### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1.git
cd AEGIS-v0.1-GUI-v0.1
```

2. **Start the backend:**
```bash
cd backend
cargo build --release
cargo run --release
```
Backend runs on `http://localhost:3000`

3. **Start the frontend (in another terminal):**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

4. **Open your browser:**
```
http://localhost:5173
```

## 🎯 Usage

### Code Lab
1. Write AegisLang code in the editor
2. Click "Compile & Run"
3. View AST, bytecode, and policy validation results

### Sandbox Runner
1. Configure sandbox limits (memory, timeout, network)
2. Write or paste AegisLang code
3. Click "Run in Sandbox"
4. View output, resource usage, and syscalls

### Fuzzing Console
1. Click "Start Campaign" to begin fuzzing
2. Monitor coverage and execution statistics
3. View crashes in real-time
4. Click "Stop Campaign" when done

### Security Timeline
1. View all security events in chronological order
2. Filter by log level or search keywords
3. Click events to view details

## 🔌 API Endpoints

### Compilation
- `POST /api/compile` - Compile AegisLang code
- `GET /api/compile/ast` - Get AST
- `GET /api/compile/bytecode` - Get bytecode

### Sandbox
- `POST /api/sandbox/run` - Run code in sandbox
- `GET /api/sandbox/logs/:id` - Get sandbox logs
- `GET /api/sandbox/resources/:id` - Get resource usage

### Fuzzing
- `POST /api/fuzz/start` - Start fuzzing campaign
- `POST /api/fuzz/stop/:id` - Stop campaign
- `GET /api/fuzz/status/:id` - Get campaign status
- `GET /api/fuzz/crashes/:id` - Get crashes

### Logs
- `GET /api/logs` - Get all logs
- `GET /api/logs/timeline` - Get security timeline

## 📁 Project Structure

```
aegis-v0.1-gui/
├── backend/                 # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── api/            # API handlers
│   │   ├── services/       # Business logic
│   │   └── models/         # Data models
│   └── Cargo.toml
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Main pages
│   │   ├── services/      # API clients
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## 🔒 Security

AEGIS Studio provides:
- Type-safe AegisLang execution
- Sandbox isolation for all runs
- Resource limits enforced
- Input validation
- Audit logging

## 🐛 Development

### Backend Development
```bash
cd backend
cargo build
cargo test
cargo run
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev    # Development server
npm run build  # Production build
npm run preview  # Preview production build
```

## 📝 License

MIT License - See main AEGIS repository

## 🔗 Links

- Main AEGIS Project: https://github.com/Everaldtah/AEGIS-v0.1-Safe-Security-Research-Sandbox
- AEGIS Documentation: https://github.com/Everaldtah/AEGIS-v0.1-Safe-Security-Research-Sandbox/blob/main/README.md

## 🙋 Support

- GitHub Issues: https://github.com/Everaldtah/AEGIS-v0.1-GUI-v0.1/issues
- Documentation: See README.md in main AEGIS repository

---

**Note:** This is v0.1.0 - Early access release. Features and APIs may change.
