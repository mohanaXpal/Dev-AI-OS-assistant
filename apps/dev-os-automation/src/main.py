"""
Dev OS Automation - Main Entry Point
Orchestrates file, app, and system control
"""

from src.models import ActionSeverity, Permission
from src.guard_agent import GuardAgent, AuditLogger
from src.file_controller import FileController
from src.app_controller import AppController
from datetime import datetime


def initialize_os_automation(user_id: str):
    """Initialize all OS automation components"""
    
    guard_agent = GuardAgent(user_id)
    audit_logger = AuditLogger(user_id)
    file_controller = FileController()
    app_controller = AppController()
    
    # Add default permissions
    default_permissions = [
        Permission("file_read", "Read files", ActionSeverity.LOW, granted=True),
        Permission("file_write", "Write files", ActionSeverity.MEDIUM, granted=True),
        Permission("file_delete", "Delete files", ActionSeverity.HIGH, granted=False),
        Permission("app_launch", "Launch applications", ActionSeverity.LOW, granted=True),
        Permission("app_close", "Close applications", ActionSeverity.MEDIUM, granted=False),
        Permission("system_control", "Control system settings", ActionSeverity.MEDIUM, granted=False),
    ]
    
    for perm in default_permissions:
        guard_agent.add_permission(perm)
    
    return {
        'guard_agent': guard_agent,
        'audit_logger': audit_logger,
        'file_controller': file_controller,
        'app_controller': app_controller
    }


def example_file_operations():
    """Example: File operations"""
    components = initialize_os_automation("user_demo")
    
    file_controller = components['file_controller']
    
    print("\n=== File Operations Example ===\n")
    
    # Create file
    result = file_controller.create_file("/tmp/test.txt", "Hello, Dev!")
    print(f"Create file: {result.message}")
    
    # Read file  
    import os
    if os.path.exists("/tmp/test.txt"):
        print(f"File exists: /tmp/test.txt")
        with open("/tmp/test.txt") as f:
            print(f"Content: {f.read()}")
    
    # Copy file
    result = file_controller.copy_file("/tmp/test.txt", "/tmp/test_copy.txt")
    print(f"Copy file: {result.message}")
    
    # Search files
    result = file_controller.search_files("/tmp", "*.txt", "name")
    print(f"Search result: {result.message}")
    if result.success:
        print(f"Found {result.output['count']} files")


def example_app_operations():
    """Example: Application operations"""
    components = initialize_os_automation("user_demo")
    
    app_controller = components['app_controller']
    
    print("\n=== Application Operations Example ===\n")
    
    # List running apps
    result = app_controller.list_running_apps()
    print(f"List apps: {result.message}")
    if result.success:
        print(f"Running apps count: {result.output['count']}")


def example_security_flow():
    """Example: Security validation with permissions"""
    from src.models import Action
    
    components = initialize_os_automation("user_demo")
    guard_agent = components['guard_agent']
    audit_logger = components['audit_logger']
    
    print("\n=== Security Validation Flow ===\n")
    
    # Action 1: Read file (allowed)
    action1 = Action(
        id="action_1",
        name="read",
        category="file",
        params={"file_path": "/tmp/test.txt"},
        severity=ActionSeverity.LOW,
        description="Read file contents"
    )
    
    is_valid, reason = guard_agent.validate(action1)
    print(f"Action 1 (file read): Valid={is_valid}, Reason={reason}")
    
    if is_valid:
        audit_logger.log_action(
            action=action1.name,
            action_type=action1.category,
            status="success",
            parameters=action1.params
        )
        print(f"✅ Action logged")
    
    # Action 2: Delete file (not allowed)
    action2 = Action(
        id="action_2",
        name="delete",
        category="file",
        params={"file_path": "/tmp/test.txt"},
        severity=ActionSeverity.CRITICAL,
        description="Delete file"
    )
    
    is_valid, reason = guard_agent.validate(action2)
    print(f"\nAction 2 (file delete): Valid={is_valid}")
    if not is_valid:
        explanation = guard_agent.generate_explanation(action2, reason)
        print(f"Explanation: {explanation}")
        
        audit_logger.log_action(
            action=action2.name,
            action_type=action2.category,
            status="blocked",
            reason=reason,
            parameters=action2.params
        )
    
    # Query audit log
    print(f"\n=== Audit Log ===")
    all_logs = audit_logger.query()
    print(f"Total logged actions: {len(all_logs)}")
    
    for log in all_logs:
        print(f"- {log.action} ({log.action_type}): {log.status}")


if __name__ == "__main__":
    example_file_operations()
    example_app_operations()
    example_security_flow()
    
    print("\n=== Dev OS Automation Ready ===\n")
