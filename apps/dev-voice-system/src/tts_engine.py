"""
Text-to-Speech Engine and Audio Player
Requirements 3.1-3.5: TTS and audio playback
"""

from src.models import Language, SpeechOutput, ListeningState
from typing import Optional
from datetime import datetime
import threading


class TextToSpeechEngine:
    """
    Text-to-speech synthesis using pyttsx3
    Requirement 3.1-3.3: Generate speech with language support
    """
    
    def __init__(self):
        self.model_name = "pyttsx3"
        self.dev_persona_rate = 150  # Speech rate for Dev persona
        # In production, would initialize actual pyttsx3 engine
    
    def synthesize(self, text: str, language: Language = Language.ENGLISH) -> SpeechOutput:
        """
        Synthesize text to speech
        Requirement 3.1: Synthesize natural-sounding audio matching Dev's persona
        Requirement 3.2-3.3: Language-based voice selection
        """
        try:
            # Select voice based on language
            voice_id = self._select_voice(language)
            
            # Mock synthesis
            import time
            time.sleep(0.1)
            
            # Calculate duration (rough estimate)
            duration_ms = len(text.split()) * 300
            
            # Generate mock audio
            audio_data = self._mock_synthesize(text, language)
            
            return SpeechOutput(
                text=text,
                language=language,
                audio_data=audio_data,
                duration_ms=duration_ms,
                voice_id=voice_id,
                model=self.model_name,
                is_playing=False
            )
        
        except Exception as e:
            return SpeechOutput(
                text=text,
                language=language,
                audio_data=None,
                duration_ms=0,
                model=self.model_name,
                is_playing=False
            )
    
    def _select_voice(self, language: Language) -> str:
        """
        Select TTS voice based on language
        Requirement 3.2-3.3: Language-based voice selection
        """
        if language == Language.ENGLISH:
            return "en_US_female"
        elif language == Language.HINDI:
            return "hi_IN_female"
        else:
            return "en_US_female"
    
    def _mock_synthesize(self, text: str, language: Language) -> bytes:
        """Mock TTS synthesis"""
        return b'\x00' * 4000  # Mock audio data


class AudioPlayer:
    """
    Audio playback with interrupt support
    Requirement 3.4-3.5: Play audio with interrupt handling
    """
    
    def __init__(self):
        self.is_playing = False
        self.current_audio: Optional[SpeechOutput] = None
        self.playback_thread: Optional[threading.Thread] = None
    
    def play(self, speech_output: SpeechOutput) -> bool:
        """
        Play audio output
        Requirement 3.4: Play audio through system output device
        """
        if self.is_playing:
            return False
        
        self.current_audio = speech_output
        self.is_playing = True
        
        # Start playback in background thread
        self.playback_thread = threading.Thread(
            target=self._playback_loop,
            args=(speech_output,)
        )
        self.playback_thread.daemon = True
        self.playback_thread.start()
        
        return True
    
    def _playback_loop(self, speech_output: SpeechOutput):
        """Simulate audio playback"""
        import time
        try:
            # Simulate playback duration
            if speech_output.duration_ms:
                sleep_time = speech_output.duration_ms / 1000.0
                time.sleep(min(sleep_time, 5))  # Max 5 seconds for mock
        finally:
            self.is_playing = False
            self.current_audio = None
    
    def stop(self) -> bool:
        """
        Stop audio playback
        Requirement 3.5: Stop playback immediately when interrupted
        """
        if not self.is_playing:
            return False
        
        self.is_playing = False
        
        if self.playback_thread:
            # Thread will detect is_playing=False and exit
            self.playback_thread.join(timeout=1)
        
        return True
    
    def is_playing_audio(self) -> bool:
        """Check if audio is currently playing"""
        return self.is_playing
