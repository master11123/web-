# 🚀 快速启动指南

## 一键启动步骤

### 第1步：安装依赖
```bash
npm install
```

### 第2步：设置数据库

#### 如果你已经有 MySQL 运行，执行：
```bash
mysql -u root -p < database.sql
```

或者在 MySQL 客户端中执行 `database.sql` 文件的内容。

**预期输出：**
```
mysql> CREATE DATABASE IF NOT EXISTS login_system ...
mysql> USE login_system;
mysql> CREATE TABLE IF NOT EXISTS users ...
mysql> CREATE TABLE IF NOT EXISTS login_logs ...
```

### 第3步：配置 .env 文件

根据你的 MySQL 设置编辑 `.env`：

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=           # 如果有密码，填在这里
DB_NAME=login_system
JWT_SECRET=your-secret-key
```

### 第4步：启动服务器

```bash
npm start
```

**预期输出：**
```
✅ 服务器运行在 http://localhost:3000
📋 数据库: login_system
```

## 测试功能

### 1️⃣ 注册新用户
- 点击 "注册新账户"
- 填写用户名、邮箱、密码
- 点击 "注册"

### 2️⃣ 登录
- 回到登录页面
- 使用注册的邮箱和密码登录
- 成功后进入用户主页

### 3️⃣ 编辑个人资料
- 在"个人信息"标签中修改用户名和简介
- 点击"保存信息"

### 4️⃣ 修改密码
- 切换到"修改密码"标签
- 输入当前密码和新密码
- 点击"修改密码"

### 5️⃣ 密码重置
- 登出或关闭浏览器
- 点击"忘记密码？"
- 输入邮箱地址
- 复制返回的重置 token
- 输入新密码并确认
- 完成重置，用新密码登录

## 文件说明

| 文件 | 说明 |
|------|------|
| `server.js` | 主服务器文件，处理路由和数据库连接 |
| `auth.js` | JWT 令牌生成和验证逻辑 |
| `auth-routes.js` | 认证相关路由（注册、登录、密码重置） |
| `users-routes.js` | 用户相关路由（获取/编辑资料、修改密码） |
| `index.html` | 前端 SPA 应用（Vue.js + CSS） |
| `database.sql` | MySQL 数据库初始化脚本 |
| `.env` | 环境变量配置 |

## API 端点列表

```
认证 (Auth)
POST   /api/auth/register              - 用户注册
POST   /api/auth/login                 - 用户登录
POST   /api/auth/forgot-password       - 请求密码重置
POST   /api/auth/reset-password        - 完成密码重置

用户 (Users)
GET    /api/users/profile              - 获取用户信息 [需要 Token]
PUT    /api/users/profile              - 编辑用户信息 [需要 Token]
PUT    /api/users/change-password      - 修改密码 [需要 Token]
```

## 使用 Postman 测试

### 1. 注册
```
POST http://localhost:3000/api/auth/register
Body (JSON):
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 2. 登录
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123"
}
响应会包含 token
```

### 3. 获取用户信息（需要 Token）
```
GET http://localhost:3000/api/users/profile
Headers:
Authorization: Bearer {token}
```

## 故障排除

### ❌ "Error: connect ECONNREFUSED"
MySQL 未运行，请启动 MySQL 服务。

### ❌ "Error: ER_NO_DB_ERROR"
数据库不存在，运行 `mysql -u root -p < database.sql`

### ❌ 前端页面空白
检查浏览器控制台（F12）是否有错误，确保 index.html 在 `public/` 目录或根目录中。

### ❌ Token 验证失败
确保在请求头中正确传递 Token：
```
Authorization: Bearer eyJhbGc...
```

## 下一步

### 生产部署建议
1. 使用环境变量管理敏感信息
2. 实现邮件发送（forgotPassword）
3. 添加速率限制防暴力破解
4. 使用 HTTPS
5. 配置适当的 CORS 策略
6. 添加数据验证中间件
7. 实现日志记录系统

### 功能扩展
- [ ] 第三方认证（Google, GitHub）
- [ ] 双因素认证（2FA）
- [ ] 用户头像上传
- [ ] 账户注销功能
- [ ] 登录历史记录
- [ ] 邮箱验证

---

需要帮助？查看 `README.md` 获取更多详细信息！
