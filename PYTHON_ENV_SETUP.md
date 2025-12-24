# 🐍 PYTHON ENVIRONMENT SETUP GUIDE

## What We're Doing

Creating **ONE Python virtual environment** that you'll use for ALL Python modules:
- ✅ dev-os-automation
- ✅ dev-voice-system
- ✅ Any future Python modules

Benefits:
- ✅ Install dependencies once
- ✅ Run tests from anywhere
- ✅ No duplicate packages
- ✅ Easy to manage

---

## 📋 STEP-BY-STEP SETUP

### STEP 1: Navigate to Workspace Root

```powershell
cd "c:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant"
```

✅ Verify you're in the right place:
```powershell
ls
# Should show: apps/, .kiro/, [documentation files]
```

---

### STEP 2: Create Virtual Environment

```powershell
python -m venv env
```

⏱ **Wait 30 seconds** for environment to be created

✅ Verify it created:
```powershell
ls
# Should now show: apps/, .kiro/, env/, [files]
```

---

### STEP 3: Activate Virtual Environment

```powershell
# On Windows PowerShell:
.\env\Scripts\Activate.ps1

# If that doesn't work, try:
.\env\Scripts\activate.bat
```

✅ Success: Your prompt should now show:
```
(env) C:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant>
```

(Notice the `(env)` prefix)

---

### STEP 4: Combine All Requirements

Create a **single requirements file** with all dependencies:

```powershell
# Create master requirements file
@"
# OS Automation Requirements
pynput==1.7.6
pygetwindow==0.0.9
psutil==5.9.5
send2trash==1.8.0

# Voice System Requirements
openai-whisper==20230314
pyttsx3==2.90
numpy==1.24.3
sounddevice==0.4.5
librosa==0.10.0

# Testing & Development
pytest==7.4.0
hypothesis==6.92.0
"@ | Out-File -FilePath "requirements-all.txt" -Encoding UTF8
```

Or manually create the file `requirements-all.txt` with the content above.

---

### STEP 5: Install All Dependencies

```powershell
pip install -r requirements-all.txt
```

⏱ **Wait 2-3 minutes** for all packages to install

✅ Success: Shows "Successfully installed..."

---

### STEP 6: Verify Installation

```powershell
pip list
```

✅ Should show all packages including:
- pynput
- psutil
- send2trash
- openai-whisper
- pyttsx3
- numpy
- sounddevice
- librosa
- pytest
- hypothesis

---

## 🎯 NOW RUN YOUR MODULES

### Test OS Automation

```powershell
# Still in env, run:
cd apps\dev-os-automation
python -m src.main
```

✅ Should work perfectly!

### Test Voice System

```powershell
# Still in env, run:
cd ..\dev-voice-system
python -m src.main
```

✅ Should work perfectly!

### Run Tests From Anywhere

```powershell
# From workspace root (in env):
pytest apps/dev-os-automation/tests/ -v
pytest apps/dev-voice-system/tests/ -v
```

---

## 🔄 ACTIVATE/DEACTIVATE ENVIRONMENT

### To Activate (do this every time you start working):
```powershell
.\env\Scripts\Activate.ps1
```

Look for `(env)` prefix in prompt.

### To Deactivate (when done working):
```powershell
deactivate
```

Prompt returns to normal (no `(env)` prefix).

---

## 📂 NEW FOLDER STRUCTURE

After setup, your workspace looks like:

```
Dev-AI-OS-assistant/
├── env/                          ← Python virtual environment
│   ├── Scripts/
│   ├── Lib/
│   ├── pyvenv.cfg
│   └── ...
├── apps/
│   ├── dev-auth-backend/
│   ├── dev-os-automation/
│   └── dev-voice-system/
├── requirements-all.txt          ← Master requirements file
├── README.md
├── START.md
└── [other docs]
```

---

## ✅ QUICK REFERENCE

### Setup (One Time)
```powershell
cd "c:\Users\suvam\Desktop\All desktop items\Hackathon\Dev-AI-OS-assistant"
python -m venv env
.\env\Scripts\Activate.ps1
pip install -r requirements-all.txt
```

### Use Environment
```powershell
# Start working session:
.\env\Scripts\Activate.ps1

# Run any Python module:
cd apps/dev-os-automation && python -m src.main
cd apps/dev-voice-system && python -m src.main

# Run tests:
pytest apps/dev-os-automation/tests/ -v

# End working session:
deactivate
```

---

## 🚀 TESTING THE SETUP

Once environment is activated and ready, test both modules:

### Test 1: OS Automation
```powershell
cd apps\dev-os-automation
python -m src.main
```

### Test 2: Voice System
```powershell
cd ..\dev-voice-system
python -m src.main
```

Both should work without any "module not found" errors ✅

---

## ❌ TROUBLESHOOTING

### "python: command not found"
```powershell
# Try:
python --version
# If doesn't work, install Python from python.org
```

### "Cannot find Activate.ps1"
```powershell
# Try using batch activation instead:
.\env\Scripts\activate.bat
```

### "Module still not found after install"
```powershell
# Make sure you're IN the activated environment:
# Look for (env) at start of prompt

# If missing, activate it:
.\env\Scripts\Activate.ps1

# Then reinstall:
pip install -r requirements-all.txt
```

### "Permission denied on Activate.ps1"
```powershell
# Run PowerShell as Administrator:
# Right-click PowerShell → "Run as administrator"
# Then try: .\env\Scripts\Activate.ps1
```

---

## 💡 PRO TIPS

### Tip 1: Create Shortcut Script
Create `activate-env.ps1` in your workspace root:
```powershell
.\env\Scripts\Activate.ps1
Write-Host "✅ Environment activated! Ready to work."
Write-Host "Run: cd apps\dev-os-automation && python -m src.main"
```

Then just run: `.\activate-env.ps1`

### Tip 2: Check Which Python You're Using
```powershell
(in activated env)
python -c "import sys; print(sys.executable)"
# Should show: C:\....\env\Scripts\python.exe
```

### Tip 3: Add New Requirements
If you add new Python modules later:
```powershell
pip install new-package-name
pip freeze > requirements-all.txt
```

### Tip 4: Save Environment State
```powershell
# Export current environment:
pip freeze > requirements-all.txt

# This makes it easy to recreate later
```

---

## 📊 ENVIRONMENT ADVANTAGES

| Task | Without Env | With Env |
|------|-------------|----------|
| Install deps | Multiple times | Once |
| Switch modules | Risk of conflicts | Clean switching |
| Run tests | May need reinstall | Works everywhere |
| Manage packages | Global pollution | Isolated |
| Share with others | Dependencies scattered | Single requirements file |

---

## 🎯 YOUR WORKFLOW

```
Day 1: Setup (15 minutes)
  1. Create virtual environment
  2. Install all dependencies
  3. Test both modules

Daily: Use Environment
  1. Activate: .\env\Scripts\Activate.ps1
  2. Run: cd apps/[module] && python -m src.main
  3. Test: pytest apps/[module]/tests/
  4. Deactivate: deactivate

Future: Add More Python Modules
  1. Add to requirements-all.txt
  2. pip install -r requirements-all.txt
  3. Test new module
  4. Done!
```

---

## ✨ WHAT YOU GET

After setup, you can:
- ✅ Run any Python module instantly
- ✅ Import packages from any location
- ✅ Run tests from anywhere
- ✅ Add new modules easily
- ✅ Share setup with team (just use requirements-all.txt)
- ✅ Switch between projects cleanly

---

## 🚀 READY TO SET UP?

Follow the steps above:

1. **Navigate to root** - `cd` to workspace root
2. **Create env** - `python -m venv env`
3. **Activate env** - `.\env\Scripts\Activate.ps1`
4. **Create requirements** - Make `requirements-all.txt` with all packages
5. **Install** - `pip install -r requirements-all.txt`
6. **Test** - `cd apps/dev-os-automation && python -m src.main`

**Total time: ~15 minutes** ⏱

Done! Now everything Python-related runs from one environment. 🎉
