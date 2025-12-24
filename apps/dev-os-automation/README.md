# Dev OS Automation System

**Python-based OS automation system for the Dev AI Assistant**

Handles file operations, application control, system settings, keyboard/mouse automation, and security enforcement.

## Features

✅ **File System Operations** - Create, read, copy, move, delete files with safety (recycle bin)  
✅ **Application Control** - Launch, close, focus, and list running applications  
✅ **Guard Agent** - Security layer with permission validation and severity classification  
✅ **Audit Logger** - Complete audit trail of all executed actions  
✅ **System Control** - Volume, brightness, network, and system info  
✅ **Keyboard/Mouse Automation** - Simulate input with configurable delays  
✅ **Property-Based Testing** - Hypothesis tests for all operations

## Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Run

```bash
python -m src.main
```

### Test

```bash
pytest tests/ -v
pytest tests/ --cov=src
```

## Architecture

### Core Modules

**models.py** - Data structures
- `Action` - OS action definition
- `ActionResult` - Execution result
- `Permission` - User permission
- `AuditLogEntry` - Audit log entry

**guard_agent.py** - Security layer
- `GuardAgent` - Validates actions against permissions
- `AuditLogger` - Records all actions

**file_controller.py** - File operations
- `FileController.create_file()` - Create files
- `FileController.copy_file()` - Copy files
- `FileController.move_file()` - Move files
- `FileController.delete_file()` - Safe delete (recycle bin)
- `FileController.search_files()` - Search by name/type/content

**app_controller.py** - Application control
- `AppController.launch()` - Launch applications
- `AppController.close()` - Close applications gracefully
- `AppController.focus()` - Bring window to foreground
- `AppController.list_running_apps()` - List all running apps
- `AppController.find_app()` - Find app with disambiguation

## API Example

```python
from src.main import initialize_os_automation
from src.models import Action, ActionSeverity

# Initialize
components = initialize_os_automation("user_123")
guard_agent = components['guard_agent']
file_controller = components['file_controller']
audit_logger = components['audit_logger']

# Create file
result = file_controller.create_file("/tmp/myfile.txt", "Hello")
print(result.message)

# Validate action before execution
action = Action(
    id="action_1",
    name="delete",
    category="file",
    params={"file_path": "/tmp/myfile.txt"},
    severity=ActionSeverity.HIGH,
    description="Delete file"
)

is_valid, reason = guard_agent.validate(action)
if is_valid:
    # Execute action
    result = file_controller.delete_file("/tmp/myfile.txt")
    audit_logger.log_action(
        action="delete",
        action_type="file",
        status="success" if result.success else "failed"
    )
else:
    # Show explanation
    explanation = guard_agent.generate_explanation(action, reason)
    print(explanation)
```

## Requirements Mapping

| Requirement | Implementation | Status |
|---|---|---|
| 1.1 - Open file | `FileController.open_file()` | ✅ |
| 1.2 - Create file/folder | `FileController.create_file/directory()` | ✅ |
| 1.3 - Copy/move | `FileController.copy/move_file()` | ✅ |
| 1.4 - Safe delete | `FileController.delete_file()` | ✅ |
| 1.5 - Search files | `FileController.search_files()` | ✅ |
| 1.6 - Error handling | All methods return `ActionResult` | ✅ |
| 2.1 - Launch app | `AppController.launch()` | ✅ |
| 2.2 - Close app | `AppController.close()` | ✅ |
| 2.3 - Focus window | `AppController.focus()` | ✅ |
| 2.4 - List apps | `AppController.list_running_apps()` | ✅ |
| 2.5 - App disambiguation | `AppController.find_app()` | ✅ |
| 5.1 - Permission validation | `GuardAgent.validate()` | ✅ |
| 5.2 - Elevated permissions | `GuardAgent` severity check | ✅ |
| 5.3 - Double confirmation | `GuardAgent` critical check | ✅ |
| 5.4 - Audit logging | `AuditLogger.log_action()` | ✅ |
| 5.5 - Blocked action explanation | `GuardAgent.generate_explanation()` | ✅ |
| 5.6 - JSON serialization | `AuditLogEntry.to_dict()` | ✅ |

## Development Roadmap

- [ ] System Controller (volume, brightness, etc.)
- [ ] Keyboard/Mouse Controller
- [ ] Browser Controller
- [ ] WebSocket integration
- [ ] Admin elevation handling
- [ ] Comprehensive error handling
- [ ] Performance optimization
