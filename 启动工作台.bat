@echo off
chcp 65001 >nul
title 千容AI工作台 · 启动器
cd /d "%~dp0workbench"

rem 检查 Node 是否存在
where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js。请先安装 Node.js 22.5 或更高版本：https://nodejs.org
  pause
  exit /b 1
)

rem 如果端口已被占用（服务已在运行），直接打开浏览器
netstat -ano | findstr "127.0.0.1:8787" | findstr LISTENING >nul 2>nul
if not errorlevel 1 (
  echo 服务已在运行，直接打开工作台...
  start "" "http://127.0.0.1:8787/"
  exit /b 0
)

rem 启动服务（最小化窗口后台运行，继承当前 workbench 目录）
echo 正在启动千容AI工作台服务...
start "千容AI工作台服务" /min cmd /c "node server.js"

rem 等待服务就绪
set /a tries=0
:waitloop
set /a tries+=1
if %tries% gtr 30 (
  echo [警告] 服务启动超时，请确认 8787 端口未被占用。
  exit /b 1
)
timeout /t 1 /nobreak >nul
netstat -ano | findstr "127.0.0.1:8787" | findstr LISTENING >nul 2>nul
if errorlevel 1 goto waitloop

echo 服务已就绪，正在打开浏览器...
start "" "http://127.0.0.1:8787/"
exit /b 0
