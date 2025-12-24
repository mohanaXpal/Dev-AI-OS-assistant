"""
File Controller - File System Operations
Requirements 1.1-1.5: File system management
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional
from src.models import FileInfo, ActionResult, Action
from datetime import datetime
import json


class FileController:
    """
    Manages file operations with safety and verification
    Requirement 1.1-1.5: File system operations
    """
    
    def open_file(self, file_path: str) -> ActionResult:
        """
        Open a file with default application
        Requirement 1.1: Locate and open the file in its default application
        """
        try:
            path = Path(file_path)
            if not path.exists():
                return ActionResult(
                    success=False,
                    action="open_file",
                    message=f"File not found: {file_path}",
                    error="FileNotFoundError"
                )
            
            # Import webbrowser for cross-platform support
            import webbrowser
            import subprocess
            import platform
            
            if platform.system() == "Darwin":  # macOS
                subprocess.run(['open', str(path)])
            elif platform.system() == "Windows":
                os.startfile(str(path))
            else:  # Linux
                subprocess.run(['xdg-open', str(path)])
            
            return ActionResult(
                success=True,
                action="open_file",
                message=f"File opened: {file_path}",
                output={"path": str(path.absolute())}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="open_file",
                message=f"Failed to open file",
                error=str(e)
            )
    
    def create_file(self, file_path: str, content: str = "") -> ActionResult:
        """
        Create a new file
        Requirement 1.2: Create a file at the specified path
        """
        try:
            path = Path(file_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            if path.exists():
                return ActionResult(
                    success=False,
                    action="create_file",
                    message=f"File already exists: {file_path}",
                    error="FileExistsError"
                )
            
            path.write_text(content)
            
            return ActionResult(
                success=True,
                action="create_file",
                message=f"File created: {file_path}",
                output={"path": str(path.absolute())}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="create_file",
                message="Failed to create file",
                error=str(e)
            )
    
    def create_directory(self, dir_path: str) -> ActionResult:
        """
        Create a new directory
        Requirement 1.2: Create a folder at the specified path
        """
        try:
            path = Path(dir_path)
            if path.exists():
                return ActionResult(
                    success=False,
                    action="create_directory",
                    message=f"Directory already exists: {dir_path}",
                    error="DirectoryExistsError"
                )
            
            path.mkdir(parents=True, exist_ok=True)
            
            return ActionResult(
                success=True,
                action="create_directory",
                message=f"Directory created: {dir_path}",
                output={"path": str(path.absolute())}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="create_directory",
                message="Failed to create directory",
                error=str(e)
            )
    
    def copy_file(self, source: str, destination: str) -> ActionResult:
        """
        Copy a file preserving source
        Requirement 1.3: Perform copy operation
        """
        try:
            src_path = Path(source)
            dst_path = Path(destination)
            
            if not src_path.exists():
                return ActionResult(
                    success=False,
                    action="copy_file",
                    message=f"Source file not found: {source}",
                    error="FileNotFoundError"
                )
            
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, dst_path)
            
            return ActionResult(
                success=True,
                action="copy_file",
                message=f"File copied: {source} -> {destination}",
                output={"source": str(src_path.absolute()), "destination": str(dst_path.absolute())}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="copy_file",
                message="Failed to copy file",
                error=str(e)
            )
    
    def move_file(self, source: str, destination: str) -> ActionResult:
        """
        Move a file atomically
        Requirement 1.3: Perform move operation atomically
        """
        try:
            src_path = Path(source)
            dst_path = Path(destination)
            
            if not src_path.exists():
                return ActionResult(
                    success=False,
                    action="move_file",
                    message=f"Source file not found: {source}",
                    error="FileNotFoundError"
                )
            
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            src_path.replace(dst_path)  # Atomic operation
            
            return ActionResult(
                success=True,
                action="move_file",
                message=f"File moved: {source} -> {destination}",
                output={"source": str(src_path.absolute()), "destination": str(dst_path.absolute())}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="move_file",
                message="Failed to move file",
                error=str(e)
            )
    
    def delete_file(self, file_path: str) -> ActionResult:
        """
        Delete a file (move to recycle bin)
        Requirement 1.4: Move the item to recycle bin (not permanent delete)
        """
        try:
            path = Path(file_path)
            if not path.exists():
                return ActionResult(
                    success=False,
                    action="delete_file",
                    message=f"File not found: {file_path}",
                    error="FileNotFoundError"
                )
            
            # Use send2trash for safe deletion to recycle bin
            try:
                from send2trash import send2trash
                send2trash(str(path))
            except ImportError:
                # Fallback to moving to trash manually
                import tempfile
                trash_path = Path(tempfile.gettempdir()) / "trash"
                trash_path.mkdir(exist_ok=True)
                path.replace(trash_path / path.name)
            
            return ActionResult(
                success=True,
                action="delete_file",
                message=f"File deleted (moved to recycle bin): {file_path}",
                output={"path": str(path.absolute())}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="delete_file",
                message="Failed to delete file",
                error=str(e)
            )
    
    def search_files(self, directory: str, pattern: str = "*", 
                     search_type: str = "name") -> ActionResult:
        """
        Search for files by name, type, or content
        Requirement 1.5: Return matching files based on name, type, or content
        """
        try:
            dir_path = Path(directory)
            if not dir_path.exists():
                return ActionResult(
                    success=False,
                    action="search_files",
                    message=f"Directory not found: {directory}",
                    error="DirectoryNotFoundError"
                )
            
            results = []
            
            if search_type == "name":
                # Search by filename pattern
                for item in dir_path.rglob(pattern):
                    if item.is_file():
                        results.append(self._file_to_dict(item))
            
            elif search_type == "type":
                # Search by file extension
                ext = pattern if pattern.startswith('.') else f".{pattern}"
                for item in dir_path.rglob(f"*{ext}"):
                    if item.is_file():
                        results.append(self._file_to_dict(item))
            
            elif search_type == "content":
                # Search by file content
                for item in dir_path.rglob("*"):
                    if item.is_file():
                        try:
                            if pattern in item.read_text():
                                results.append(self._file_to_dict(item))
                        except:
                            pass  # Skip binary files
            
            return ActionResult(
                success=True,
                action="search_files",
                message=f"Found {len(results)} matching files",
                output={"results": results, "count": len(results)}
            )
        except Exception as e:
            return ActionResult(
                success=False,
                action="search_files",
                message="Failed to search files",
                error=str(e)
            )
    
    def _file_to_dict(self, path: Path) -> dict:
        """Convert file to dictionary representation"""
        stat = path.stat()
        return {
            "path": str(path.absolute()),
            "name": path.name,
            "size": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "extension": path.suffix
        }
