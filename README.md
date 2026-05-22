# Web 登录系统

一个完整的 Web 登录系统，包含注册、登录、密码重置和用户资料编辑功能。

## 功能特性

✨ **核心功能**
- 🔐 用户注册和登录
- 🔑 密码重置和修改
- 👤 用户资料编辑
- 🛡️ JWT Token 认证
- 🔒 密码加密存储 (bcrypt)

## 技术栈

**后端：**
- Node.js + Express
- MySQL 数据库
- JWT 认证
- bcryptjs 密码加密

**前端：**
- Vue.js 3 (CDN)
- Axios HTTP 请求
- 响应式设计

## 快速开始

### 1. 环境要求

- Node.js >= 12
- MySQL >= 5.7

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

#### 方式1: 使用 MySQL 命令行

```bash
mysql -u root -p < database.sql
```

#### 方式2: 在 MySQL 客户端执行

打开 MySQL 客户端，执行 `database.sql` 文件中的 SQL 语句。

### 4. 配置环境变量

编辑 `.env` 文件：

```
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=login_system

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
```

### 5. 启动服务器

```bash
npm start
```

访问 http://localhost:3000

## 项目结构

```
web-login-system/
├── server.js              # 主服务器文件
├── auth.js                # JWT 认证逻辑
├── auth-routes.js         # 认证路由（登录、注册、密码重置）
├── users-routes.js        # 用户路由（资料编辑）
├── index.html             # 前端单页应用
├── database.sql           # 数据库初始化脚本
├── .env                   # 环境变量
└── package.json           # 项目依赖
```

## API 文档

### 认证模块 `/api/auth`

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱@example.com",
  "password": "密码",
  "confirmPassword": "确认密码"
}

响应: { success: true, message: "注册成功，请登录" }
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "邮箱@example.com",
  "password": "密码"
}

响应: {
  success: true,
  data: {
    token: "jwt_token",
    user: { id, username, email }
  }
}
```

#### 忘记密码
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "邮箱@example.com"
}

响应: { success: true, resetToken: "token" }
```

#### 重置密码
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "reset_token",
  "newPassword": "新密码",
  "confirmPassword": "确认密码"
}

响应: { success: true, message: "密码已重置" }
```

### 用户模块 `/api/users`

#### 获取用户信息
```
GET /api/users/profile
Authorization: Bearer {token}

响应: {
  success: true,
  data: { id, username, email, avatar, bio, updated_at }
}
```

#### 更新用户信息
```
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "新用户名",
  "bio": "个人简介",
  "avatar": "头像URL"
}

响应: { success: true, message: "用户信息已更新" }
```

#### 修改密码
```
PUT /api/users/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "当前密码",
  "newPassword": "新密码",
  "confirmPassword": "确认密码"
}

响应: { success: true, message: "密码已修改" }
```

## 安全特性

🔒 **安全措施**
- 密码使用 bcryptjs 加密，存储 hash
- JWT Token 用于无状态认证
- 密码重置令牌有有效期限制（1小时）
- 密码最小长度要求（6字符）
- CORS 防护
- 敏感错误信息隐藏

## 密码需求

- 最小长度：6 个字符
- 必须重新输入确认
- 使用 bcryptjs 加密存储

## 开发建议

### 生产环境配置

1. 更改 JWT_SECRET：
```
JWT_SECRET=use-a-long-random-string-here
```

2. 启用 HTTPS
3. 实施速率限制
4. 添加邮件发送功能（目前忘记密码在开发环境显示 token）
5. 添加数据验证和清理
6. 配置适当的 CORS 策略

### 邮件发送集成

在 `auth-routes.js` 的 `forgot-password` 路由中添加：

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 发送重置链接
await transporter.sendMail({
  to: email,
  subject: '密码重置链接',
  html: `请点击此链接重置密码: ${resetLink}`
});
```

## 常见问题

### Q: 数据库连接失败？
A: 检查 `.env` 中的数据库配置，确保 MySQL 服务运行。

### Q: 前端请求返回 401？
A: 确保已登录并正确传递 Authorization header: `Bearer {token}`

### Q: 如何本地测试？
A: 使用 Postman 或 curl 测试 API 端点，前端已包含完整 UI。

## License

MIT
