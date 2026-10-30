@echo off
setlocal
set "BLENDER_USER_RESOURCES=%~dp0..\..\toolchain\blender-profile"
set "TEMP=%~dp0..\..\toolchain\cache"
set "TMP=%TEMP%"
"%~dp0..\..\toolchain\blender-4.5.15-windows-x64\blender.exe" --background --factory-startup --python-exit-code 1 --python "%~dp0build-thinker.py"
exit /b %errorlevel%
