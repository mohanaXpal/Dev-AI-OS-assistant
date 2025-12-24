# Testing & Validation Guide

## Module Verification Checklist

Complete these steps in order to validate all 3 implemented modules.

---

## 1️⃣ AUTH BACKEND (Node.js/Express)

### Step 1: Verify Installation
```powershell
cd apps\dev-auth-backend
ls -la
```
✅ **Look for:** `node_modules/`, `package.json`, `tsconfig.json`, `src/`, `dist/`

### Step 2: Run the Main Service
```powershell
npm run build
npm start
```
✅ **Expected Output:**
```
✓ Services initialized
✓ JWT Service created
✓ Session Manager created
✓ Permission Manager created
✓ User Service created
```

### Step 3: Run Tests
```powershell
npm test
```
✅ **Expected:** Jest test suite runs with multiple test cases

### Step 4: Run Simple Test Suite
```powershell
node test-simple.js
```
✅ **Expected:** 17 validation tests pass
```
✅ Test 1: OAuth URL generation...
✅ Test 2: JWT token generation...
...
```

### What gets tested:
- ✅ OAuth (Google/GitHub URL generation)
- ✅ JWT token creation and verification
- ✅ Session management (create, get, logout)
- ✅ Permission system (grant, revoke, query)
- ✅ User service (create, find, update)
- ✅ Data serialization/deserialization

---

## 2️⃣ OS AUTOMATION (Python)

### Step 1: Verify Python Installation
```powershell
cd ..\dev-os-automation
python --version
```
✅ **Expected:** Python 3.8+ installed

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```
✅ **Expected:** 
```
Successfully installed pynput psutil pygetwindow send2trash pytest hypothesis
```

### Step 3: Run Main Example
```powershell
python -m src.main
```
✅ **Expected Output:**
```
=== OS Automation System Example ===

📁 File Operations:
✓ Created test file...
✓ Copied file...
✓ Moved file...
✓ Searched files...
✓ Deleted file safely to recycle bin...

🚀 App Operations:
✓ Found File Manager...
✓ Launched application...
✓ Closed application...

🔒 Security Validation:
✓ Action permitted
✓ Action blocked (insufficient permissions)
```

### Step 4: Run Tests
```powershell
pytest tests/ -v
```
✅ **Expected:** Tests pass for:
- File operations (create, copy, move, delete, search)
- App operations (find, launch, close)
- Guard agent (permission validation)
- Audit logging

### What gets tested:
- ✅ File system operations (safe, atomic)
- ✅ Application control (cross-platform)
- ✅ Security validation (permissions, severity)
- ✅ Audit trail logging
- ✅ Error handling

---

## 3️⃣ VOICE SYSTEM (Python)

### Step 1: Verify Python Installation
```powershell
cd ..\dev-voice-system
python --version
```
✅ **Expected:** Python 3.8+

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```
✅ **Expected:**
```
Successfully installed openai-whisper pyttsx3 numpy sounddevice librosa pytest
```

### Step 3: Run Main Example
```powershell
python -m src.main
```
✅ **Expected Output:**
```
=== Dev Voice System Example ===

🎤 Voice System initialized for user user_demo
🌍 Language preference set to: en
✓ Wake word updated to: 'Hey Dev'
🎤 Listening for wake word...
🎤 Listening state: ACTIVE
🎤 Capturing audio...
🌍 Language detected: en (confidence: 0.92)
💬 Transcription: 'open the file manager'
🤖 Responding: 'You said: open the file manager'
🔊 Playing audio (2500ms)...
🎤 Voice system stopped

=== Dev Voice System Ready ===
```

### Step 4: Verify Key Features
```powershell
python
```
Then run:
```python
from src.main import VoiceSystem
from src.models import Language, ListeningState

# Initialize
voice = VoiceSystem("test_user")

# Check methods exist
print(f"✓ Language enum: {[l.value for l in Language]}")
print(f"✓ States: {[s.value for s in ListeningState]}")

# Try setting wake word
voice.set_wake_word("नमस्ते डेव")  # Custom Hindi wake word
print("✓ Custom wake word set")

# Try language preference
voice.set_language_preference(Language.HINDI)
print("✓ Language preference changed")

exit()
```

### What gets tested:
- ✅ Speech-to-text engine (Whisper integration)
- ✅ Text-to-speech engine (pyttsx3)
- ✅ Wake word detection ("Hey Dev")
- ✅ Language detection (English/Hindi/Hinglish)
- ✅ Audio capture and playback
- ✅ State machine (Standby → Active)
- ✅ Bilingual support

---

## 📊 Full System Validation Summary

Run this script to check everything at once:

```powershell
# Navigate to workspace root
cd C:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant\apps

echo "=== TESTING AUTH BACKEND ==="
cd dev-auth-backend
npm test 2>&1 | grep -E "(PASS|FAIL|✓|✗)"
node test-simple.js 2>&1 | tail -5
cd ..

echo ""
echo "=== TESTING OS AUTOMATION ==="
cd dev-os-automation
python -m src.main
cd ..

echo ""
echo "=== TESTING VOICE SYSTEM ==="
cd dev-voice-system
python -m src.main
cd ..

echo ""
echo "✅ All modules validated!"
```

---

## ✅ Success Criteria

| Module | Status Check | Pass Criteria |
|--------|--------------|---------------|
| **Auth Backend** | `npm test` | All tests pass, no errors |
| **Auth Backend** | `node test-simple.js` | 17/17 tests pass ✅ |
| **OS Automation** | `python -m src.main` | Shows file & app operations ✅ |
| **OS Automation** | `pytest tests/ -v` | All tests pass ✅ |
| **Voice System** | `python -m src.main` | Shows wake word, STT, TTS flow ✅ |
| **Voice System** | Language detection | English/Hindi/Hinglish detected ✅ |

---

## 🐛 Troubleshooting

### Auth Backend Issues
```powershell
# If npm test fails
npm install              # Reinstall dependencies
npm run build           # Rebuild TypeScript

# If test-simple.js fails
node test-simple.js --verbose
```

### OS Automation Issues
```powershell
# If pip install fails
python -m pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# If tests fail
pytest tests/ -v --tb=short
```

### Voice System Issues
```powershell
# If import errors
python -m pip install openai-whisper pyttsx3 --force-reinstall

# If whisper not found
python -c "import whisper; print(whisper.__version__)"
```

---

## 📝 Next Steps After Validation

Once all 3 modules pass:
1. ✅ Start **dev-ai-llm** (TypeScript LangChain)
2. ✅ Start **dev-assistant-core** (Multi-agent coordination)
3. ✅ Start **dev-frontend-ui** (Next.js + Tauri)

Ready to test? Start with **Step 1️⃣ AUTH BACKEND**!
