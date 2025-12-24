"""
Dev OS Automation - Core Data Structures
Requirement 1.2: Define core data classes and enums
"""

from dataclasses import dataclass, asdict
from enum import Enum
from typing import Optional, Any, List
from datetime import datetime

class ActionSeverity(Enum):
    """Action severity levels for guard validation"""
    LOW = "low"  # Safe operations (read-only)
    MEDIUM = "medium"  # Modify system state
    HIGH = "high"  # Destructive operations
    CRITICAL = "critical"  # Requires explicit user confirmation


@dataclass
class Permission:
    """User permission for an action"""
    name: str
    description: str
    severity: ActionSeverity
    granted: bool = False
    granted_at: Optional[datetime] = None


@dataclass
class ActionResult:
    """Result of an executed action"""
    success: bool
    action: str
    message: str
    output: Optional[Any] = None
    error: Optional[str] = None
    execution_time_ms: Optional[float] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class Action:
    """An OS action to be executed"""
    id: str
    name: str
    category: str  # file, app, system, browser, keyboard, mouse
    params: dict
    severity: ActionSeverity
    requires_confirmation: bool = False
    description: str = ""


@dataclass
class FileInfo:
    """Information about a file"""
    path: str
    name: str
    size: int
    created_at: datetime
    modified_at: datetime
    is_directory: bool
    permissions: str
    extension: Optional[str] = None


@dataclass
class AppInfo:
    """Information about a running application"""
    pid: int
    name: str
    title: str
    path: Optional[str] = None
    memory_mb: float = 0
    cpu_percent: float = 0


@dataclass
class SystemInfo:
    """System information"""
    os: str  # Windows, Linux, macOS
    cpu_count: int
    cpu_percent: float
    memory_total_gb: float
    memory_available_gb: float
    disk_usage_percent: dict  # drive -> percent
    battery_percent: Optional[float] = None
    battery_plugged: Optional[bool] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


@dataclass
class AuditLogEntry:
    """Audit log entry for executed actions"""
    user_id: str
    action: str
    action_type: str
    status: str  # success, failed, blocked
    reason: Optional[str] = None
    parameters: Optional[dict] = None
    result: Optional[ActionResult] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        if self.result:
            data['result'] = self.result.to_dict()
        return data
