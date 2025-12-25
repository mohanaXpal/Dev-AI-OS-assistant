from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import sys
import os

# Add parent directory to path so 'src' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import initialize_os_automation, example_app_operations
from src.models import Action, ActionSeverity

app = FastAPI(title="Dev OS Automation API")

# Initialize controllers
components = initialize_os_automation("user_default")
file_controller = components['file_controller']
app_controller = components['app_controller']
guard_agent = components['guard_agent']

class ExecuteRequest(BaseModel):
    action: str  # e.g., "open_app", "create_file"
    params: Dict[str, Any] = {}

class ExecuteResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@app.get("/")
def health_check():
    return {"status": "online", "service": "Dev OS Automation"}

@app.post("/execute", response_model=ExecuteResponse)
def execute_command(req: ExecuteRequest):
    print(f"📥 Received command: {req.action} with params: {req.params}")
    
    # 1. Map string action to internal logic (Simple mapping for now)
    try:
        if req.action == "open_app":
            app_name = req.params.get("app_name")
            if not app_name:
                raise ValueError("app_name is required")
            
            # TODO: Add specific app path mapping if needed, or rely on AppController
            # For now, let's assume AppController has a generic 'open' method or we mock it
            # The existing example used 'list_running_apps'. We need to implement 'launch_app'.
            # I will check if AppController has launch_app, if not I'll add a simple os.startfile here or in controller
            
            import os
            # Simple direct execution for MVP (Windows specific)
            # In a real scenario, use AppController.launch_app(app_name)
            
            # Security Check (Basic)
            action_obj = Action("launch", "launch", "app", req.params, ActionSeverity.LOW, "Launch App")
            valid, reason = guard_agent.validate(action_obj)
            if not valid:
                 return ExecuteResponse(success=False, message=f"Permission Denied: {reason}")
            
            # Attempt to launch
            # Common apps mapping
            apps_map = {
                "chrome": "chrome",
                "notepad": "notepad",
                "calc": "calc",
                "code": "code",
                "explorer": "explorer"
            }
            
            target = apps_map.get(app_name.lower(), app_name)
            os.system(f"start {target}")
            
            return ExecuteResponse(success=True, message=f"Launched {target}")

        elif req.action == "list_apps":
            result = app_controller.list_running_apps()
            return ExecuteResponse(success=result.success, message=result.message, data=result.output)

        else:
            return ExecuteResponse(success=False, message=f"Unknown action: {req.action}")

    except Exception as e:
        print(f"❌ Error: {e}")
        return ExecuteResponse(success=False, message=str(e))

if __name__ == "__main__":
    print("🚀 Starting OS Automation Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
