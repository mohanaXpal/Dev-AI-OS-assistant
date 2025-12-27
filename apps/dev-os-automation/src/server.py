from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, Set
import uvicorn
import sys
import os
import asyncio
import json
from datetime import datetime

# Add parent directory to path so 'src' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import initialize_os_automation, example_app_operations
from src.models import Action, ActionSeverity

# System control libraries
import psutil
try:
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
    from comtypes import CLSCTX_ALL
    from ctypes import cast, POINTER
    import screen_brightness_control as sbc
except ImportError:
    print("⚠️  Warning: System control libraries not found. Some features will be mocked.")

app = FastAPI(title="Dev OS Automation API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize controllers
components = initialize_os_automation("user_default")
file_controller = components['file_controller']
app_controller = components['app_controller']
guard_agent = components['guard_agent']

# WebSocket connections store
active_connections: Set[WebSocket] = set()

class ExecuteRequest(BaseModel):
    action: str  # e.g., "open_app", "create_file"
    params: Dict[str, Any] = {}

class ExecuteResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class CommandRequest(BaseModel):
    command: str

@app.get("/")
def health_check():
    return {"status": "online", "service": "Dev OS Automation"}

@app.get("/system/status")
def get_system_status():
    """Get real-time system status"""
    try:
        cpu = psutil.cpu_percent()
        mem = psutil.virtual_memory().percent
        
        # Real Volume
        current_volume = 50
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume = cast(interface, POINTER(IAudioEndpointVolume))
            current_volume = int(volume.GetMasterVolumeLevelScalar() * 100)
        except: pass

        # Real Brightness
        current_brightness = 70
        try:
            current_brightness = sbc.get_brightness()[0]
        except: pass
        
        return {
            "volume": current_volume,
            "brightness": current_brightness,
            "wifi": {
                "connected": True,
                "name": "Dev-Network"
            },
            "network": "Connected",
            "cpu_usage": cpu,
            "memory_usage": mem,
            "disk_usage": psutil.disk_usage('C:').percent if os.name == 'nt' else psutil.disk_usage('/').percent
        }
    except Exception as e:
        print(f"❌ Error getting system status: {e}")
        return {
            "volume": 50,
            "brightness": 75,
            "wifi": {"connected": True, "name": "Unknown"},
            "network": "Online",
            "cpu_usage": 0,
            "memory_usage": 0,
            "disk_usage": 0
        }
    except Exception as e:
        print(f"❌ Error getting system status: {e}")
        return {
            "volume": 50,
            "brightness": 75,
            "wifi": {"connected": True, "name": "Unknown"},
            "network": "Online",
            "cpu_usage": 0,
            "memory_usage": 0,
            "disk_usage": 0
        }

@app.get("/history")
def get_command_history():
    """Get command history from session"""
    try:
        # In production, this would fetch from a database
        commands = []
        running_apps = app_controller.list_running_apps()
        
        if running_apps.success and running_apps.output:
            apps = running_apps.output.get('apps', [])[:5]
            for app in apps:
                commands.append({
                    "id": str(app.get('pid', '')),
                    "command": f"Application Running: {app.get('name', 'Unknown')}",
                    "description": f"PID: {app.get('pid', 'N/A')}",
                    "timestamp": datetime.now().strftime("%I:%M %p")
                })
        
        return {"commands": commands}
    except Exception as e:
        print(f"❌ Error getting history: {e}")
        return {"commands": []}

@app.post("/execute", response_model=ExecuteResponse)
def execute_command(req: ExecuteRequest):
    print(f"📥 Received command: {req.action} with params: {req.params}")
    
    try:
        if req.action == "open_app":
            app_name = req.params.get("app_name")
            if not app_name:
                raise ValueError("app_name is required")
            
            import string
            app_name = app_name.strip(string.punctuation).strip()

            # Security Check
            action_obj = Action("launch", "launch", "app", req.params, ActionSeverity.LOW, "Launch App")
            valid, reason = guard_agent.validate(action_obj)
            if not valid:
                 return ExecuteResponse(success=False, message=f"Permission Denied: {reason}")
            
            # Common apps mapping
            apps_map = {
                "chrome": "chrome",
                "google chrome": "chrome",
                "notepad": "notepad",
                "nodepad": "notepad",
                "calc": "calc",
                "calculator": "calc",
                "code": "code",
                "vs code": "code",
                "visual studio code": "code",
                "explorer": "explorer"
            }
            
            target = apps_map.get(app_name.lower(), app_name)
            # Use Popen for non-blocking launch
            import subprocess
            subprocess.Popen(f'start "" "{target}"', shell=True)
            
            # Broadcast activity to WebSocket clients
            asyncio.create_task(broadcast_activity({
                "type": "success",
                "title": "App Launched",
                "message": f"Successfully launched {target}"
            }))
            
            return ExecuteResponse(success=True, message=f"Launched {target}")

        elif req.action == "set_volume":
            direction = req.params.get("direction", "up")
            try:
                devices = AudioUtilities.GetSpeakers()
                interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
                volume = cast(interface, POINTER(IAudioEndpointVolume))
                
                current_vol = volume.GetMasterVolumeLevelScalar()
                if direction == "up":
                    new_vol = min(1.0, current_vol + 0.1)
                elif direction == "down":
                    new_vol = max(0.0, current_vol - 0.1)
                elif direction == "mute":
                    volume.SetMute(1, None)
                    return ExecuteResponse(success=True, message="System muted")
                elif direction == "unmute":
                    volume.SetMute(0, None)
                    return ExecuteResponse(success=True, message="System unmuted")
                else:
                    new_vol = float(direction) / 100.0 if str(direction).isdigit() else current_vol
                
                volume.SetMasterVolumeLevelScalar(new_vol, None)
                msg = f"Volume set to {int(new_vol * 100)}%"
                return ExecuteResponse(success=True, message=msg)
            except Exception as e:
                return ExecuteResponse(success=False, message=f"Volume control failed: {e}")

        elif req.action == "set_mic_mute":
            mute_status = req.params.get("mute", True)
            try:
                from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
                from comtypes import CLSCTX_ALL
                from ctypes import cast, POINTER
                
                # Get default capture device (Microphone)
                enumerator = AudioUtilities.GetDeviceEnumerator()
                # 1 = eCapture, 1 = eCommunications
                mic_device = enumerator.GetDefaultAudioEndpoint(1, 1) 
                interface = mic_device.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
                volume = cast(interface, POINTER(IAudioEndpointVolume))
                
                volume.SetMute(1 if mute_status else 0, None)
                state = "muted" if mute_status else "unmuted"
                
                asyncio.create_task(broadcast_activity({
                    "type": "warning" if mute_status else "success",
                    "title": "Mic Status",
                    "message": f"System microphone {state}"
                }))
                
                return ExecuteResponse(success=True, message=f"Microphone {state}")
            except Exception as e:
                print(f"❌ Mic Error: {e}")
                return ExecuteResponse(success=False, message=f"Mic control failed: {e}")

        elif req.action == "set_brightness":
            level = req.params.get("level", 50)
            try:
                sbc.set_brightness(int(level))
                msg = f"Brightness set to {level}%"
                return ExecuteResponse(success=True, message=msg)
            except Exception as e:
                return ExecuteResponse(success=False, message=f"Brightness control failed: {e}")

        elif req.action == "power":
            mode = req.params.get("mode", "lock")
            print(f"⚡ Power action: {mode}")
            if mode == "lock":
                os.system("rundll32.exe user32.dll,LockWorkStation")
            elif mode == "sleep":
                os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
            elif mode == "shutdown":
                return ExecuteResponse(success=False, message="Shutdown blocked for safety")
            return ExecuteResponse(success=True, message=f"System {mode} initiated")

        elif req.action == "list_apps":
            result = app_controller.list_running_apps()
            return ExecuteResponse(success=result.success, message=result.message, data=result.output)

        else:
            return ExecuteResponse(success=False, message=f"Unknown action: {req.action}")

    except Exception as e:
        print(f"❌ Error: {e}")
        return ExecuteResponse(success=False, message=str(e))

@app.post("/command")
def handle_command(req: CommandRequest):
    """Handle voice/text commands"""
    try:
        command = req.command.lower()
        
        # Parse and execute command
        if "open" in command and "chrome" in command:
            return execute_command(ExecuteRequest(action="open_app", params={"app_name": "chrome"}))
        elif "open" in command and ("code" in command or "vs" in command):
            return execute_command(ExecuteRequest(action="open_app", params={"app_name": "code"}))
        elif "list" in command and "apps" in command:
            return execute_command(ExecuteRequest(action="list_apps"))
        else:
            return ExecuteResponse(success=True, message=f"Command received: {command}")
    
    except Exception as e:
        return ExecuteResponse(success=False, message=str(e))

@app.post("/system/execute")
def execute_system_command(req: CommandRequest):
    """Execute system commands like lock, sleep, shutdown"""
    try:
        command = req.command.lower()
        
        if command == "lock":
            os.system("rundll32.exe user32.dll,LockWorkStation")
            return {"success": True, "message": "System locked"}
        
        elif command == "sleep":
            os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
            return {"success": True, "message": "System going to sleep"}
        
        elif command == "shutdown":
            # Warning: This will actually shut down the system
            # In production, you might want a confirmation step
            return {"success": False, "message": "Shutdown requires confirmation"}
        
        else:
            return {"success": False, "message": f"Unknown system command: {command}"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo back acknowledgment
            await websocket.send_json({
                "type": "ack",
                "message": "Message received"
            })
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    
    finally:
        active_connections.discard(websocket)

async def broadcast_activity(activity: Dict[str, Any]):
    """Broadcast activity to all connected WebSocket clients"""
    message = {
        "type": "activity",
        "timestamp": datetime.now().strftime("%I:%M %p"),
        **activity
    }
    
    for connection in list(active_connections):
        try:
            await connection.send_json(message)
        except:
            # Connection might be closed
            active_connections.discard(connection)

if __name__ == "__main__":
    print("🚀 Starting OS Automation Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
