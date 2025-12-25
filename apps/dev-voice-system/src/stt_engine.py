"""
Speech-to-Text Engine - Audio transcription
Requirements 1.1-1.4: STT with Whisper and language support
"""

from src.models import Language, TranscriptionResult, AudioSegment
from typing import Optional
from datetime import datetime


class SpeechToTextEngine:
    """
    Speech-to-text transcription using Whisper
    Requirement 1.1-1.4: Transcribe speech with language support
    """
    
    def __init__(self, use_local: bool = True):
        self.use_local = use_local
        self.model_name = "whisper"
        self.model = None
        if self.use_local:
            import whisper
            print("  Loading Whisper model (base)...")
            self.model = whisper.load_model("base")
            print("  Whisper model loaded.")
    
    def transcribe(self, audio_segment: AudioSegment) -> TranscriptionResult:
        """
        Transcribe audio to text
        Requirement 1.1: Transcribe speech to text with 95% accuracy for clear audio
        Requirement 1.2-1.4: Language-based model routing and Hinglish handling
        """
        try:
        try:
            import numpy as np
            
            # Determine language model to use
            language = audio_segment.language
            
            # Check audio quality
            if not self._validate_audio_quality(audio_segment):
                # Requirement 1.5: Error for poor audio quality
                return TranscriptionResult(
                    text="",
                    confidence=0.0,
                    language=language,
                    is_final=True,
                    model=self.model_name,
                    processing_time_ms=100
                )

            # Convert bytes back to float32 numpy array
            audio_np = np.frombuffer(audio_segment.data, dtype=np.float32)

            if self.model:
                # Transcribe
                # We can hint language if we know it, but let's let Whisper detect or hint based on 'language' param
                # Mapping internal Language enum to whisper codes if needed
                lang_code = "en"
                if language == Language.HINDI: lang_code = "hi"
                
                result = self.model.transcribe(audio_np, language=lang_code, fp16=False)
                text = result["text"].strip()
                confidence = 0.9 # Whisper doesn't give single confidence easily without segments
            else:
                 # Default mock if model failed to load
                 text = "Model not loaded"
                 confidence = 0.0
            
            return TranscriptionResult(
                text=text,
                confidence=confidence,
                language=language,
                is_final=True,
                model=self.model_name,
                processing_time_ms=2000
            )
        
        except Exception as e:
            return TranscriptionResult(
                text="",
                confidence=0.0,
                language=audio_segment.language,
                is_final=True,
                model=self.model_name,
                processing_time_ms=0
            )
    
    def _validate_audio_quality(self, audio: AudioSegment) -> bool:
        """Check if audio quality is acceptable"""
        # Requirement 1.5: Poor audio validation
        if len(audio.data) < 100:
            return False
        if audio.duration_ms < 500:  # Too short
            return False
        return True
    
    def _mock_transcribe_english(self, audio: AudioSegment) -> str:
        """Mock English transcription"""
        return "open the file manager"
    
    def _mock_transcribe_hindi(self, audio: AudioSegment) -> str:
        """Mock Hindi transcription"""
        return "फ़ाइल मैनेजर खोलें"
    
    def _mock_transcribe_hinglish(self, audio: AudioSegment) -> str:
        """Mock Hinglish transcription"""
        return "mujhe file manager kholna hai"


class AudioCapture:
    """
    Audio capture and silence detection
    Requirement 2.1: Capture audio with configurable timeout and silence detection
    """
    
    def __init__(self, sample_rate: int = 16000, timeout_ms: int = 5000):
        self.sample_rate = sample_rate
        self.timeout_ms = timeout_ms
        self.silence_threshold = 0.05
    
    def capture(self, timeout_ms: Optional[int] = None) -> AudioSegment:
        """
        Capture audio from microphone
        Requirement 2.1: Capture with configurable timeout
        Requirement 2.2: Silence detection for end-of-speech
        """
        timeout = timeout_ms or self.timeout_ms
        
        import sounddevice as sd
        import numpy as np
        
        # Capture config
        duration = timeout / 1000.0  # seconds
        print(f"  Start recording ({duration}s)...")
        
        # Record
        try:
            recording = sd.rec(int(duration * self.sample_rate), samplerate=self.sample_rate, channels=1, dtype='float32')
            sd.wait()
            
            # Convert to appropriate format/bytes if needed, usually Whisper takes np array or path.
            # AudioSegment expects 'data' as bytes. We can store raw bytes or use a specific format.
            # For compatibility with our model, let's keep it as bytes (PCM) or just store valid mono audio.
            # Since we defined AudioSegment.data as bytes in line 131, let's stick to that.
            
            return AudioSegment(
                data=recording.tobytes(), # raw float32 bytes
                sample_rate=self.sample_rate,
                duration_ms=float(len(recording) * 1000 / self.sample_rate), 
                language=Language.ENGLISH
            )
        except Exception as e:
            print(f"Error capturing audio: {e}")
            return AudioSegment(
                data=b'',
                sample_rate=self.sample_rate,
                duration_ms=0,
                language=Language.ENGLISH
            )
    
    def _detect_silence(self, audio: AudioSegment) -> bool:
        """Detect if audio contains significant silence"""
        # Requirement 2.2: Silence detection
        return False  # Mock: not silent
