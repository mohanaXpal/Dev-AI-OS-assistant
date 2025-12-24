# Dev AI Assistant - Spec Overview

This project is organized into **5 modular specs**, each covering a distinct technical domain. This separation allows parallel development and clear ownership.

## Spec Structure

```
.kiro/specs/
├── dev-assistant-core/     # Core orchestration & agent coordination
├── dev-voice-system/       # STT, TTS, bilingual voice (Whisper + pyttsx3)
├── dev-os-automation/      # Python OS control (files, apps, settings)
├── dev-auth-backend/       # Node.js OAuth, permissions, MongoDB
├── dev-ai-llm/             # LLM integration (GPT/Gemini/Ollama + LangChain)
└── dev-frontend-ui/        # Next.js dashboard + Tauri desktop app
```

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Web UI | Next.js + Tailwind + Framer Motion + Three.js |
| Desktop | Tauri (Rust wrapper) |
| Backend | Node.js (NestJS) + OAuth + JWT |
| Database | MongoDB |
| AI | GPT-4 / Gemini / Claude + Ollama (local) |
| Orchestration | LangChain / LlamaIndex |
| Voice | Whisper (STT) + pyttsx3/Coqui (TTS) |
| OS Automation | Python (subprocess, pynput, pygetwindow) |

## Development Order (Recommended)

1. **dev-auth-backend** - Foundation for user identity & permissions
2. **dev-os-automation** - Core Jarvis functionality
3. **dev-voice-system** - Voice interface
4. **dev-ai-llm** - Intelligence layer
5. **dev-assistant-core** - Orchestration tying it all together
6. **dev-frontend-ui** - Visual interface

## Next Steps

Each spec needs:
1. ✅ Requirements (created)
2. ⬜ Design document
3. ⬜ Implementation tasks

Start with any spec by opening its `requirements.md` and proceeding through the design phase.
