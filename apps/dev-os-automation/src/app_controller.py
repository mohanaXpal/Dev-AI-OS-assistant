"""
Application Controller - Application Control Operations
Requirements 2.1-2.5: Application management
"""

import subprocess
import platform
from typing import List, Optional
from src.models import AppInfo, ActionResult


class AppController:
    """
    Manages application control - launch, close, focus
    Requirement 2.1-2.5: Application control
    """
    
    def __init__(self):
        self.os_type = platform.system()
    
    def launch(self, app_name: str, app_path: str = None) -> ActionResult:
        """
        Launch an application
        Requirement 2.1: Launch the application by name or path
        """
        try:
            if self.os_type == "Windows":
                if app_path:
                    subprocess.Popen(app_path)
                else:
                    # Search in common paths
                    subprocess.Popen(f"start {app_name}", shell=True)
            
            elif self.os_type == "Darwin":  # macOS
                if app_path:
                    subprocess.run(['open', app_path])
                else:
                    subprocess.run(['open', '-a', app_name])
            
            else:  # Linux
                subprocess.Popen([app_name])
            
            return ActionResult(
                success=True,
                action="launch_app",
                message=f"Application launched: {app_name}",
                output={"app_name": app_name}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="launch_app",
                message=f"Failed to launch application",
                error=str(e)
            )
    
    def close(self, app_name: str, graceful: bool = True) -> ActionResult:
        """
        Close an application gracefully
        Requirement 2.2: Terminate the application gracefully
        """
        try:
            if self.os_type == "Windows":
                if graceful:
                    subprocess.run(['taskkill', '/IM', f"{app_name}.exe"], 
                                 check=False)
                else:
                    subprocess.run(['taskkill', '/F', '/IM', f"{app_name}.exe"], 
                                 check=False)
            
            elif self.os_type == "Darwin":
                if graceful:
                    subprocess.run(['killall', app_name], check=False)
                else:
                    subprocess.run(['killall', '-9', app_name], check=False)
            
            else:  # Linux
                if graceful:
                    subprocess.run(['killall', app_name], check=False)
                else:
                    subprocess.run(['killall', '-9', app_name], check=False)
            
            return ActionResult(
                success=True,
                action="close_app",
                message=f"Application closed: {app_name}",
                output={"app_name": app_name}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="close_app",
                message="Failed to close application",
                error=str(e)
            )
    
    def focus(self, app_name: str) -> ActionResult:
        """
        Bring application window to foreground
        Requirement 2.3: Bring the application window to foreground
        """
        try:
            if self.os_type == "Windows":
                try:
                    import pygetwindow as gw
                    windows = gw.getWindowsWithTitle(app_name)
                    if windows:
                        windows[0].activate()
                except:
                    subprocess.run(['wmctrl', '-a', app_name], check=False)
            
            elif self.os_type == "Darwin":
                subprocess.run([
                    'osascript', '-e',
                    f'tell application "{app_name}" to activate'
                ], check=False)
            
            else:  # Linux
                subprocess.run(['wmctrl', '-a', app_name], check=False)
            
            return ActionResult(
                success=True,
                action="focus_app",
                message=f"Application focused: {app_name}",
                output={"app_name": app_name}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="focus_app",
                message="Failed to focus application",
                error=str(e)
            )
    
    def list_running_apps(self) -> ActionResult:
        """
        List all running applications
        Requirement 2.4: Return all active application windows with their titles
        """
        try:
            apps = []
            
            if self.os_type == "Windows":
                try:
                    import psutil
                    for proc in psutil.process_iter(['pid', 'name']):
                        try:
                            apps.append({
                                "pid": proc.info['pid'],
                                "name": proc.info['name'],
                                "title": proc.info['name']
                            })
                        except:
                            pass
                except:
                    # Fallback using tasklist
                    result = subprocess.run(['tasklist'], capture_output=True, text=True)
                    for line in result.stdout.split('\n')[3:]:
                        if line.strip():
                            parts = line.split()
                            if len(parts) >= 2:
                                apps.append({
                                    "name": parts[0],
                                    "pid": int(parts[1]) if parts[1].isdigit() else 0,
                                    "title": parts[0]
                                })
            
            elif self.os_type == "Darwin":
                try:
                    import psutil
                    for proc in psutil.process_iter(['pid', 'name']):
                        try:
                            apps.append({
                                "pid": proc.info['pid'],
                                "name": proc.info['name'],
                                "title": proc.info['name']
                            })
                        except:
                            pass
                except:
                    pass
            
            else:  # Linux
                try:
                    import psutil
                    for proc in psutil.process_iter(['pid', 'name']):
                        try:
                            apps.append({
                                "pid": proc.info['pid'],
                                "name": proc.info['name'],
                                "title": proc.info['name']
                            })
                        except:
                            pass
                except:
                    pass
            
            return ActionResult(
                success=True,
                action="list_apps",
                message=f"Found {len(apps)} running applications",
                output={"apps": apps, "count": len(apps)}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="list_apps",
                message="Failed to list applications",
                error=str(e)
            )
    
    def find_app(self, app_name: str) -> ActionResult:
        """
        Find running application by name
        Requirement 2.5: Detect when name matches multiple apps
        """
        try:
            # Get all running apps
            result = self.list_running_apps()
            
            if not result.success:
                return result
            
            apps = result.output.get('apps', [])
            matches = [app for app in apps if app_name.lower() in app['name'].lower()]
            
            if len(matches) == 0:
                return ActionResult(
                    success=False,
                    action="find_app",
                    message=f"No running application found: {app_name}",
                    error="AppNotFoundError"
                )
            
            elif len(matches) > 1:
                return ActionResult(
                    success=True,
                    action="find_app",
                    message=f"Multiple applications match '{app_name}': {len(matches)} found. Please clarify which one.",
                    output={"matches": matches, "ambiguous": True}
                )
            
            else:
                return ActionResult(
                    success=True,
                    action="find_app",
                    message=f"Found application: {matches[0]['name']}",
                    output={"app": matches[0], "ambiguous": False}
                )
        except Exception as e:
            return ActionResult(
                success=False,
                action="find_app",
                message="Failed to find application",
                error=str(e)
            )
