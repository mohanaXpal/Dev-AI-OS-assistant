"""
Wake Word Detector - Always-on listening and activation
Requirements 2.1-2.5: Wake word detection with state machine
"""

from src.models import Language, ListeningState, WakeWordConfig
from enum import Enum
import threading
from datetime import datetime, timedelta
from typing import Optional, Callable


class WakeWordDetector:
    """
    Detects wake word for assistant activation
    Requirement 2.1-2.5: Always-on listening with wake word detection
    """
    
    def __init__(self, config: Optional[WakeWordConfig] = None):
        self.config = config or WakeWordConfig()
        self.state = ListeningState.STANDBY
        self.last_wake_time: Optional[datetime] = None
        self.silence_timeout_s = 5  # Requirement 2.4: 5-second timeout
        self.listeners: list[Callable] = []
        self.monitoring = False
        self.monitor_thread: Optional[threading.Thread] = None
    
    def on_state_change(self, listener: Callable):
        """Register listener for state changes"""
        self.listeners.append(listener)
    
    def _notify_listeners(self, new_state: ListeningState):
        """Notify all listeners of state change"""
        for listener in self.listeners:
            try:
                listener(new_state)
            except:
                pass
    
    def start_monitoring(self):
        """
        Start always-on wake word detection
        Requirement 2.1: Continuously monitor for wake word with minimal resource usage
        """
        if self.monitoring:
            return
        
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.monitoring:
            if self.state == ListeningState.STANDBY:
                # Lightweight monitoring
                if self._detect_wake_word():
                    self._transition_to_active()
            
            elif self.state == ListeningState.ACTIVE:
                # Check for silence timeout
                elapsed = (datetime.now() - self.last_wake_time).total_seconds()
                if elapsed > self.silence_timeout_s:
                    # Requirement 2.4: Return to standby after 5 seconds of silence
                    self._transition_to_standby()
            
            import time
            time.sleep(0.1)  # Check every 100ms
    
    def _detect_wake_word(self) -> bool:
        """
        Detect wake word in audio stream
        Requirement 2.2: Detect "Hey Dev" within 200ms
        Requirement 2.5: Support custom wake word
        """
        # Mock detection
        import random
        return random.random() < 0.01  # ~1% chance per check for testing
    
    def _transition_to_active(self):
        """
        Transition from standby to active listening
        Requirement 2.2: Transition within 200ms
        Requirement 2.3: Capture subsequent utterance for processing
        """
        if self.state != ListeningState.STANDBY:
            return
        
        self.state = ListeningState.ACTIVE
        self.last_wake_time = datetime.now()
        self._notify_listeners(ListeningState.ACTIVE)
        print(f"✓ Wake word detected: '{self.config.phrase}'")
    
    def _transition_to_standby(self):
        """Return to standby after timeout"""
        if self.state == ListeningState.ACTIVE:
            self.state = ListeningState.STANDBY
            self._notify_listeners(ListeningState.STANDBY)
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=1)
    
    def get_state(self) -> ListeningState:
        """Get current listening state"""
        return self.state
    
    def set_custom_wake_word(self, phrase: str):
        """
        Set custom wake word
        Requirement 2.5: Support custom wake word configuration
        """
        self.config.custom = True
        self.config.phrase = phrase
        print(f"✓ Wake word updated to: '{phrase}'")
    
    def reset_to_default_wake_word(self):
        """Reset to default wake word"""
        self.config.phrase = "Hey Dev"
        self.config.custom = False
        print(f"✓ Wake word reset to default: 'Hey Dev'")


class LanguageDetector:
    """
    Detect language from audio
    Requirement 4.1-4.5: Language detection with fallback
    """
    
    def __init__(self):
        self.last_detected_language = Language.ENGLISH
        self.confidence_threshold = 0.7
    
    def detect_from_audio(self, audio_data: bytes, 
                         user_preferred: Language = Language.ENGLISH) -> tuple[Language, float]:
        """
        Detect language from audio
        Requirement 4.1-4.3: Detect language within 2 seconds with confidence scoring
        """
        try:
            # Mock language detection
            import random
            
            # Simulate detection
            import time
            time.sleep(0.1)  # Mock processing
            
            confidence = random.uniform(0.75, 0.98)
            
            # Requirement 4.3: Fallback to user preferred if low confidence
            if confidence < self.confidence_threshold:
                return user_preferred, confidence
            
            # Randomly detect one of three languages
            detected = random.choice([Language.ENGLISH, Language.HINDI, Language.HINGLISH])
            self.last_detected_language = detected
            
            return detected, confidence
        
        except Exception:
            return user_preferred, 0.0
    
    def override_language(self, language: Language):
        """
        Override automatic detection
        Requirement 4.4: User can explicitly specify language
        """
        self.last_detected_language = language
        return language
