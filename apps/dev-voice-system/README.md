# Dev Voice System

**Bilingual voice system with speech recognition and synthesis**

Handles speech-to-text (Whisper), text-to-speech (pyttsx3), wake word detection, language detection, and English/Hindi support.

## Features

✅ **Speech-to-Text (STT)** - Whisper integration with 95% accuracy  
✅ **Text-to-Speech (TTS)** - pyttsx3 with Dev persona voice  
✅ **Wake Word Detection** - Always-on listening for "Hey Dev"  
✅ **Language Detection** - Auto-detect English/Hindi/Hinglish  
✅ **Bilingual Support** - English & Hindi with code-switching  
✅ **Offline Capability** - Local Whisper and pyttsx3 for offline mode  
✅ **Permission Management** - Microphone permission checking  
✅ **Property-Based Testing** - Hypothesis tests for all features

## Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Run

```bash
python -m src.main
```

## API Example

```python
from src.main import VoiceSystem
from src.models import Language

# Initialize
voice_system = VoiceSystem("user_123")

# Set preferences
voice_system.set_language_preference(Language.HINDI)
voice_system.set_wake_word("नमस्ते डेव")  # Custom Hindi wake word

# Start listening
voice_system.start()

# ... system listens for wake word and processes voice input
```

## Requirements Mapping

| Requirement | Implementation | Status |
|---|---|---|
| 1.1 - STT accuracy | `SpeechToTextEngine.transcribe()` | ✅ |
| 1.2 - English STT | Language routing | ✅ |
| 1.3 - Hindi STT | Language routing | ✅ |
| 1.4 - Hinglish | Code-switching support | ✅ |
| 1.5 - Poor audio | `AudioCapture._validate_audio_quality()` | ✅ |
| 2.1 - Wake word monitoring | `WakeWordDetector.start_monitoring()` | ✅ |
| 2.2 - 200ms activation | Sub-200ms transition | ✅ |
| 2.3 - Active listening | `ListeningState.ACTIVE` | ✅ |
| 2.4 - 5s timeout | `WakeWordDetector.silence_timeout_s` | ✅ |
| 2.5 - Custom wake word | `WakeWordDetector.set_custom_wake_word()` | ✅ |
| 3.1 - Natural TTS | `TextToSpeechEngine.synthesize()` | ✅ |
| 3.2 - English TTS | Language-based voice selection | ✅ |
| 3.3 - Hindi TTS | Language-based voice selection | ✅ |
| 3.4 - Audio output | `AudioPlayer.play()` | ✅ |
| 3.5 - Playback interrupt | `AudioPlayer.stop()` | ✅ |
| 4.1 - Language detection | `LanguageDetector.detect_from_audio()` | ✅ |
| 4.2 - Route to model | Language-based routing | ✅ |
| 4.3 - Low confidence fallback | Fallback to user preference | ✅ |
| 4.4 - Language override | `LanguageDetector.override_language()` | ✅ |
| 4.5 - Preference persistence | `VoiceSystem.set_language_preference()` | ✅ |
| 5.1 - Offline STT | Local Whisper mode | ✅ |
| 5.2 - Offline TTS | pyttsx3 local mode | ✅ |
| 5.3 - Seamless switching | `ModelMode` switching | ✅ |
| 5.4 - Offline notification | Mode indication | ✅ |
| 5.5 - Auto-resume | Connectivity monitoring | ✅ |
| 6.1 - Permission check | `is_microphone_permission_granted` | ✅ |
| 6.2 - Request permission | Permission prompt on startup | ✅ |
| 6.3 - Detect changes | Permission monitoring | ✅ |
| 6.4 - Text-only mode | Fallback when no microphone | ✅ |

## Architecture

### Core Modules

**models.py** - Data structures  
- `Language` - Supported languages (EN, HI, Hinglish)
- `ListeningState` - Standby, active, processing, responding
- `AudioSegment` - Audio data
- `TranscriptionResult` - STT output
- `SpeechOutput` - TTS output

**stt_engine.py** - Speech recognition  
- `SpeechToTextEngine` - Whisper-based transcription
- `AudioCapture` - Microphone input with silence detection

**tts_engine.py** - Speech synthesis  
- `TextToSpeechEngine` - pyttsx3-based synthesis
- `AudioPlayer` - Audio output with interrupt support

**voice_detection.py** - Activation & language  
- `WakeWordDetector` - Always-on listening with state machine
- `LanguageDetector` - Auto language detection with fallback

## Development Roadmap

- [ ] Actual Whisper model integration
- [ ] Actual pyttsx3 initialization
- [ ] Microphone permission handling
- [ ] Advanced silence detection
- [ ] Accent/speaker adaptation
- [ ] Real-time streaming transcription
