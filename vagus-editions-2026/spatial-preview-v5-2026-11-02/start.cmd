@echo off
cd /d "%~dp0"
if exist "C:\Users\15049\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
 "C:\Users\15049\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.cjs
) else (
 node server.cjs
)
