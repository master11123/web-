@echo off
REM Web登录系统 - Windows 启动脚本

echo 🚀 Web 登录系统 - 启动脚本
echo ================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 访问: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js 已安装: 
node --version
echo.

REM 安装依赖
echo 📦 安装依赖中...
call npm install

echo.
echo ⚙️  请确保:
echo   1. MySQL 服务已启动
echo   2. 运行了命令: mysql -u root -p ^< database.sql
echo   3. .env 文件中的数据库配置正确
echo.
echo 按任意键继续...
pause

REM 启动服务器
echo 🚀 启动服务器...
call npm start
