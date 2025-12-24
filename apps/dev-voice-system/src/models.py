"""
Voice System - Models and Enums
Requirements 1.1-5.0: Voice system data structures
"""

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Optional
from datetime import datetime


class Language(Enum):
    """Supported languages"""
    ENGLISH = "en"
    HINDI = "hi"
    HINGLISH = "hi-en"  # Code-switching


class ListeningState(Enum):
    """Voice system listening state"""
    STANDBY = "standby"  # Waiting for wake word
    ACTIVE = "active"  # Actively listening
    PROCESSING = "processing"  # Processing audio
    RESPONDING = "responding"  # Playing response


class ModelMode(Enum):
    """Model operating mode"""
    ONLINE = "online"  # Cloud models
    OFFLINE = "offline"  # Local models


@dataclass
class AudioSegment:
    """Audio data segment"""
    data: bytes
    sample_rate: int
    duration_ms: float
    language: Language = Language.ENGLISH
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class TranscriptionResult:
    """Speech-to-text result"""
    text: str
    confidence: float  # 0-1
    language: Language
    is_final: bool = True
    processing_time_ms: Optional[float] = None
    model: str = "whisper"  # STT model used
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class SpeechOutput:
    """Text-to-speech output"""
    text: str
    language: Language
    audio_data: Optional[bytes] = None
    duration_ms: Optional[float] = None
    voice_id: str = "default"
    model: str = "pyttsx3"  # TTS model used
    is_playing: bool = False
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class WakeWordConfig:
    """Wake word configuration"""
    phrase: str = "Hey Dev"
    language: Language = Language.ENGLISH
    confidence_threshold: float = 0.7
    enabled: bool = True
    custom: bool = False


@dataclass
class LanguagePreference:
    """User language preferences"""
    primary: Language = Language.ENGLISH
    secondary: Language = Language.ENGLISH
    auto_detect: bool = True
    confidence_threshold: float = 0.7
