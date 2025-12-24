# 🎯 Module Testing Checklist

## ✅ BEFORE YOU START

Make sure you're in the right directory:
```powershell
cd "c:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant"
ls apps/
```

You should see 3 folders:
- ✅ apps/dev-auth-backend
- ✅ apps/dev-os-automation
- ✅ apps/dev-voice-system

---

## 🧪 TEST 1: AUTH BACKEND (Node.js)

### Step 1: Navigate
```powershell
cd apps\dev-auth-backend
```

### Step 2: Install Dependencies
```powershell
npm install
```
**⏱ Wait ~30 seconds** for 381 packages to install

**✅ Success:** Shows "added 381 packages"

### Step 3: Run Tests
```powershell
node test-simple.js
```

**✅ Expected Output:**
```
✅ Test 1: OAuth URL generation...
✅ Test 2: JWT token generation...
✅ Test 3: JWT verification...
✅ Test 4: Session creation...
✅ Test 5: Session retrieval...
✅ Test 6: Session logout...
✅ Test 7: Permission grant...
✅ Test 8: Permission revoke...
✅ Test 9: Permission query...
✅ Test 10: User creation...
✅ Test 11: User serialization...
✅ Test 12: OAuth callback...
✅ Test 13: Token rotation...
✅ Test 14: Session update...
✅ Test 15: Permission listener...
✅ Test 16: Multiple sessions...
✅ Test 17: User export...

✅ All tests passed! (17/17)
```

**❌ If it fails:** Try `npm run build` first, then run tests again

---

## 🧪 TEST 2: OS AUTOMATION (Python)

### Step 1: Navigate
```powershell
cd ..\dev-os-automation
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

**⏱ Wait ~20 seconds** for packages to install

**✅ Success:** Shows packages like pynput, psutil, send2trash installed

### Step 3: Run Example
```powershell
python -m src.main
```

**✅ Expected Output:**
```
=== OS Automation System Example ===

📁 File Operations:
✓ Created test file: C:\path\to\test.txt
✓ Copied file successfully
✓ Moved file to new location
✓ Searched files: found 5 results
✓ Deleted file safely to recycle bin

🚀 App Operations:
✓ Found application: File Manager
✓ Launched: File Manager
✓ Closed: File Manager
✓ Listed 8 running applications

🔒 Security Validation:
✓ HIGH severity action permitted
✓ CRITICAL action blocked: insufficient permissions
✓ Audit entry logged

=== Workflow Complete ===
```

**❌ If it fails:**
- Try: `pip install -r requirements.txt --force-reinstall`
- Or: `python --version` (should be 3.8+)

---

## 🧪 TEST 3: VOICE SYSTEM (Python)

### Step 1: Navigate
```powershell
cd ..\dev-voice-system
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

**⏱ Wait ~20 seconds** for packages to install

**✅ Success:** Shows packages installed (whisper, pyttsx3, numpy, etc.)

### Step 3: Run Example
```powershell
python -m src.main
```

**✅ Expected Output:**
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

**❌ If it fails:**
- Try: `pip install openai-whisper pyttsx3 --force-reinstall`
- Or: Check Python version with `python --version`

---

## 📊 Verification Matrix

| Module | File | Command | Expected |
|--------|------|---------|----------|
| **Auth Backend** | test-simple.js | `node test-simple.js` | 17/17 ✅ |
| **OS Automation** | src/main.py | `python -m src.main` | Shows ✓ file ops |
| **Voice System** | src/main.py | `python -m src.main` | Shows 🎤 voice flow |

---

## ⚡ Quick Copy-Paste Test All 3

Run each command separately:

```powershell
# Test 1
cd "c:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant\apps\dev-auth-backend" ; npm install ; node test-simple.js

# Test 2
cd "c:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant\apps\dev-os-automation" ; pip install -r requirements.txt ; python -m src.main

# Test 3
cd "c:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant\apps\dev-voice-system" ; pip install -r requirements.txt ; python -m src.main
```

---

## 🎓 What Each Test Verifies

### Auth Backend Tests:
✅ OAuth URL generation (Google/GitHub)  
✅ JWT token creation with 900s expiry  
✅ Token verification and validation  
✅ Refresh token rotation  
✅ Session creation and management  
✅ Permission grant/revoke  
✅ User CRUD operations  

### OS Automation Tests:
✅ Safe file creation with pathlib  
✅ Atomic file operations (copy/move)  
✅ Safe deletion to recycle bin  
✅ File search with wildcards  
✅ App launching and closing  
✅ Permission validation  
✅ Severity classification  
✅ Audit trail logging  

### Voice System Tests:
✅ Speech-to-text (Whisper) routing  
✅ Language detection (EN/HI/Hinglish)  
✅ Wake word detection state machine  
✅ Text-to-speech synthesis  
✅ Audio capture and playback  
✅ Microphone permission checking  
✅ Offline/online mode switching  
✅ Listening state transitions  

---

## 🏁 Success Criteria

### ✅ ALL 3 TESTS PASS WHEN:
- Auth Backend: Shows ✅ for all 17 tests
- OS Automation: Shows ✓ for file and app operations
- Voice System: Shows 🎤 and ✓ for voice features

### ❌ FAILURE SIGNS:
- Command not found
- Module not found (ImportError)
- Dependency missing
- Port already in use
- Permission denied

---

## 🆘 Troubleshooting Quick Links

### Node.js issues?
```powershell
node --version       # Should be v14+
npm --version        # Should be v6+
npm cache clean --force
npm install
```

### Python issues?
```powershell
python --version     # Should be 3.8+
pip --version
pip install --upgrade pip
```

### Still stuck?
1. Check you're in the correct directory: `pwd`
2. List files: `ls`
3. Try reinstalling: `pip install -r requirements.txt --force-reinstall`
4. Use admin mode (right-click → Run as Administrator)

---

## 📞 Files That Can Help

**In workspace root:**
- 📄 [START_HERE.md](./START_HERE.md) - Overview of all 3 modules
- 📄 [QUICK_TEST.md](./QUICK_TEST.md) - Copy-paste ready commands
- 📄 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Detailed test guide
- 📄 [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md) - Complete report

---

## 🎯 You're Ready!

Pick any module above and start testing:
1. Navigate to the module directory
2. Install dependencies (`npm install` or `pip install -r requirements.txt`)
3. Run the test/example
4. Verify the expected output

**Good luck! 🚀**
