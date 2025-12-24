"""
Dev Voice System - Main orchestration
Integrates STT, TTS, wake word detection, and language management
"""

from src.models import Language, ListeningState, ModelMode
from src.stt_engine import SpeechToTextEngine, AudioCapture
from src.tts_engine import TextToSpeechEngine, AudioPlayer
from src.voice_detection import WakeWordDetector, LanguageDetector
from typing import Optional


class VoiceSystem:
    """
    Main voice system orchestrator
    Coordinates STT, TTS, wake word, and language detection
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.model_mode = ModelMode.ONLINE
        
        # Initialize components
        self.stt_engine = SpeechToTextEngine()
        self.tts_engine = TextToSpeechEngine()
        self.audio_capture = AudioCapture()
        self.audio_player = AudioPlayer()
        self.wake_word_detector = WakeWordDetector()
        self.language_detector = LanguageDetector()
        
        # State
        self.current_language = Language.ENGLISH
        self.is_microphone_permission_granted = True  # Mock
    
    def start(self):
        """Start voice system"""
        print(f"🎤 Voice System initialized for user {self.user_id}")
        
        # Start wake word detection
        self.wake_word_detector.on_state_change(self._on_listening_state_change)
        self.wake_word_detector.start_monitoring()
        
        print("🎤 Listening for wake word...")
    
    def _on_listening_state_change(self, new_state: ListeningState):
        """Handle listening state changes"""
        if new_state == ListeningState.ACTIVE:
            print(f"🎤 Listening state: ACTIVE")
            # Trigger audio capture
            self._process_voice_input()
        elif new_state == ListeningState.STANDBY:
            print(f"🎤 Listening state: STANDBY (timeout)")
    
    def _process_voice_input(self):
        """Process incoming voice input"""
        print(f"🎤 Capturing audio...")
        
        # Capture audio
        audio = self.audio_capture.capture(timeout_ms=5000)
        
        # Detect language
        language, confidence = self.language_detector.detect_from_audio(audio.data)
        print(f"🌍 Language detected: {language.value} (confidence: {confidence:.2f})")
        
        # Transcribe
        audio.language = language
        result = self.stt_engine.transcribe(audio)
        
        if result.text:
            print(f"💬 Transcription: '{result.text}'")
        else:
            print(f"💬 Could not transcribe (confidence: {result.confidence})")
        
        # Auto-respond (mock)
        self._respond_to_user(f"You said: {result.text}")
    
    def _respond_to_user(self, response_text: str):
        """Generate speech response"""
        print(f"🤖 Responding: '{response_text}'")
        
        # Synthesize speech
        speech = self.tts_engine.synthesize(response_text, self.current_language)
        
        # Play audio
        print(f"🔊 Playing audio ({speech.duration_ms:.0f}ms)...")
        self.audio_player.play(speech)
    
    def set_wake_word(self, phrase: str):
        """Set custom wake word"""
        self.wake_word_detector.set_custom_wake_word(phrase)
    
    def set_language_preference(self, language: Language):
        """Set language preference"""
        self.current_language = language
        print(f"🌍 Language preference set to: {language.value}")
    
    def override_language(self, language: Language):
        """Override current language for this session"""
        self.language_detector.override_language(language)
        print(f"🌍 Language overridden to: {language.value}")
    
    def stop(self):
        """Stop voice system"""
        self.wake_word_detector.stop_monitoring()
        self.audio_player.stop()
        print("🎤 Voice system stopped")


def example_voice_flow():
    """Example voice system usage"""
    print("\n=== Dev Voice System Example ===\n")
    
    # Initialize
    voice_system = VoiceSystem("user_demo")
    
    # Set preferences
    voice_system.set_language_preference(Language.ENGLISH)
    voice_system.set_wake_word("Hey Dev")
    
    # Start
    voice_system.start()
    
    # Simulate listening
    import time
    time.sleep(2)
    
    # Stop
    voice_system.stop()


if __name__ == "__main__":
    example_voice_flow()
    print("\n=== Dev Voice System Ready ===\n")
