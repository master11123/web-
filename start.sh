#!/bin/bash
# 一键启动脚本 (for Windows users, use npm commands instead)

echo "🚀 Web 登录系统 - 一键启动"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"
echo ""

# 安装依赖
echo "📦 安装依赖中..."
npm install

echo ""
echo "⚙️  请确保:"
echo "  1. MySQL 服务已启动"
echo "  2. 运行了: mysql -u root -p < database.sql"
echo "  3. .env 文件中的数据库配置正确"
echo ""

# 启动服务器
echo "🚀 启动服务器..."
npm start
