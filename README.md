# DEV.OS - The Advanced AI Operating System Assistant

![DEV.OS Mockup](C:/Users/suvam/.gemini/antigravity/brain/7513d439-0c19-4ce0-ade3-e0ff9736f0bd/dev_os_mockup_1766807395022.png)

## 🚀 Overview
**DEV.OS** is a next-generation AI-powered Operating System assistant designed to bridge the gap between human intent and OS execution. Built with a modular microservices architecture, it leverages cutting-edge LLMs (Gemini) to automate desktop workflows, manage system settings, and integrate seamlessly with developer tools like GitHub.

---

## 🏗️ Architecture

```mermaid
graph TD
    UI[Frontend: Next.js] <--> BE[Backend: Express.js]
    BE <--> LLM[AI Brain: Gemini]
    BE <--> DB[(MongoDB)]
    BE <--> OS[OS Automation: Python]
    OS <--> Sys[System: Windows/macOS]
    BE -- Socket.io --> UI
```

### Component Breakdown
- **Frontend (`dev-frontend-ui`)**: A futuristic dashboard built with Next.js, featuring real-time system metrics and AI interaction.
- **Backend (`dev-auth-backend`)**: The central gateway handling authentication (Google/GitHub), command processing, and AI orchestration.
- **OS Automation (`dev-os-automation`)**: A localized Python microservice that executes low-level system commands (volume, brightness, power, file management).
- **AI Brain**: Integrated with Google's Gemini Flash for high-performance natural language understanding and recursive action triggering.

---

## 🛠️ Tech Stack
- **Languages**: TypeScript, JavaScript, Python
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas (Mongoose)
- **AI**: Google Gemini AI
- **OS Layer**: FastAPI, PyAutoGUI, pywin32

---

## 📂 Project Structure
```text
.
├── apps/
│   ├── dev-frontend-ui/       # Next.js Frontend
│   ├── dev-auth-backend/      # Node.js Auth & API Gateway
│   ├── dev-os-automation/     # Python OS Execution Layer
│   ├── dev-voice-system/      # (Optional) Voice processing
│   └── dev-assistant-core/    # Shared logic & Interfaces
├── packages/                  # Shared utilities
└── env/                       # Python Virtual Environment
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB Atlas Account
- Google & GitHub OAuth Credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/suvam-paul145/Dev-AI-OS-assistant.git
   cd Dev-AI-OS-assistant
   ```

2. **Setup Backend**
   ```bash
   cd apps/dev-auth-backend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd apps/dev-frontend-ui
   npm install
   npm run dev
   ```

4. **Setup OS Automation**
   ```bash
   cd apps/dev-os-automation
   pip install -r requirements.txt
   python main.py
   ```

---

## 🛡️ Key Features
- **Intelligent Command Processing**: Natural interaction using LLMs.
- **Dynamic GitHub Sync**: Automatically push generated code to your repositories.
- **System Control**: Direct control over volume, brightness, power states, and application launching.
- **OAuth Integration**: Securely link Google and GitHub accounts.
- **Real-time Activity Feed**: Live updates of system actions via Socket.io.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by the **DEV.OS Team**.
