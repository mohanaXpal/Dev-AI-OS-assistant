"""
Guard Agent - Security Layer for OS Automation
Requirements 5.1-5.6: Security and permission enforcement
"""

from typing import Tuple, Optional
from src.models import Action, ActionSeverity, Permission, AuditLogEntry, ActionResult
from datetime import datetime


class GuardAgent:
    """
    Security layer that validates actions before execution
    Requirement 5.1: Validate the action against user's permission whitelist before execution
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.permissions: dict = {}  # permission_name -> Permission
        self.blocked_count = 0
        
    def add_permission(self, permission: Permission) -> None:
        """Add a permission to user's whitelist"""
        self.permissions[permission.name] = permission
    
    def has_permission(self, permission_name: str) -> bool:
        """Check if user has a permission granted"""
        perm = self.permissions.get(permission_name)
        return perm is not None and perm.granted
    
    def validate(self, action: Action) -> Tuple[bool, Optional[str]]:
        """
        Validate action against permissions and severity
        Returns: (is_valid, error_message)
        Requirement 5.1: Validate action against permission whitelist
        """
        # Check if permission exists and is granted
        action_permission = f"{action.category}_{action.name.lower()}"
        
        if not self.has_permission(action_permission):
            reason = f"User does not have permission for {action.category}:{action.name}"
            return False, reason
        
        # Check severity
        if action.severity == ActionSeverity.CRITICAL:
            # Requirement 5.2: Elevated permission requires explicit confirmation
            reason = "Action requires elevated permissions - user confirmation needed"
            return False, reason
        
        if action.severity == ActionSeverity.HIGH:
            # Requirement 5.3: Destructive action requires double confirmation
            if not self.is_double_confirmed(action):
                reason = "Destructive action requires double confirmation"
                return False, reason
        
        return True, None
    
    def is_double_confirmed(self, action: Action) -> bool:
        """
        Check if action is marked as double-confirmed
        Requirement 5.3: Destructive action double confirmation
        """
        return action.params.get('double_confirmed', False)
    
    def classify_severity(self, action: Action) -> ActionSeverity:
        """
        Classify action severity based on category and type
        Requirement 5.1: Severity classification
        """
        category = action.category.lower()
        action_name = action.name.lower()
        
        # Destructive file operations
        if category == 'file' and action_name in ['delete', 'format', 'overwrite']:
            return ActionSeverity.CRITICAL
        
        # File modification
        if category == 'file' and action_name in ['move', 'copy', 'rename']:
            return ActionSeverity.MEDIUM
        
        # File read
        if category == 'file' and action_name in ['read', 'list', 'search', 'open']:
            return ActionSeverity.LOW
        
        # App control
        if category == 'app' and action_name in ['launch', 'focus', 'list']:
            return ActionSeverity.LOW
        
        if category == 'app' and action_name in ['close', 'kill']:
            return ActionSeverity.MEDIUM
        
        # System control
        if category == 'system' and action_name in ['restart', 'shutdown']:
            return ActionSeverity.CRITICAL
        
        if category == 'system' and action_name in ['volume', 'brightness', 'network']:
            return ActionSeverity.LOW
        
        # Browser
        if category == 'browser':
            return ActionSeverity.LOW
        
        # Input
        if category in ['keyboard', 'mouse']:
            return ActionSeverity.MEDIUM
        
        return ActionSeverity.MEDIUM
    
    def request_confirmation(self, action: Action) -> str:
        """
        Generate user-friendly confirmation prompt
        Requirement 5.2: Prompt user for explicit confirmation
        """
        return f"Action '{action.name}' requires confirmation. Allow? (yes/no)"
    
    def generate_explanation(self, action: Action, reason: str) -> str:
        """
        Generate explanation for blocked action
        Requirement 5.5: Explain why action was blocked and how to grant permission
        """
        perm_name = f"{action.category}_{action.name.lower()}"
        return (
            f"Action blocked: {reason}\n"
            f"To allow '{action.name}' on '{action.category}', "
            f"please grant the '{perm_name}' permission in settings."
        )


class AuditLogger:
    """
    Logs all executed actions for audit trail
    Requirement 5.4: Record all executed commands with timestamps
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.logs: list[AuditLogEntry] = []
    
    def log_action(
        self,
        action: str,
        action_type: str,
        status: str,
        result: Optional[ActionResult] = None,
        reason: Optional[str] = None,
        parameters: Optional[dict] = None
    ) -> AuditLogEntry:
        """
        Log an action execution
        Requirement 5.4, 5.6: Log with timestamp, JSON serializable
        """
        entry = AuditLogEntry(
            user_id=self.user_id,
            action=action,
            action_type=action_type,
            status=status,
            reason=reason,
            parameters=parameters,
            result=result,
            timestamp=datetime.now()
        )
        self.logs.append(entry)
        return entry
    
    def query(self, start_date: datetime = None, end_date: datetime = None, 
              action_type: str = None, status: str = None) -> list[AuditLogEntry]:
        """
        Query logs with filters
        Requirement 5.6: Support querying by date range
        """
        results = self.logs
        
        if start_date:
            results = [log for log in results if log.timestamp >= start_date]
        
        if end_date:
            results = [log for log in results if log.timestamp <= end_date]
        
        if action_type:
            results = [log for log in results if log.action_type == action_type]
        
        if status:
            results = [log for log in results if log.status == status]
        
        return results
    
    def export_logs(self, start_date: datetime = None, 
                    end_date: datetime = None) -> str:
        """
        Export logs as JSON
        Requirement 5.6: JSON serialization
        """
        import json
        filtered = self.query(start_date, end_date)
        data = [log.to_dict() for log in filtered]
        return json.dumps(data, indent=2, default=str)
