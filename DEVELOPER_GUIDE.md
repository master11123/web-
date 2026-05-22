# 🎓 开发者指南

## 项目架构

### 三层架构
```
┌─────────────────────────────────────┐
│     前端层 (Frontend)                 │
│  Vue.js SPA + HTML/CSS/JavaScript    │
│         (index.html)                  │
└──────────────┬──────────────────────┘
               │ HTTP/AJAX
┌──────────────▼──────────────────────┐
│     API 层 (Express Routes)           │
│  /api/auth     /api/users             │
│  认证路由      用户路由               │
└──────────────┬──────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────┐
│     数据层 (MySQL Database)           │
│  users表  login_logs表                │
└─────────────────────────────────────┘
```

## 核心模块说明

### 1. server.js - 主服务器
```javascript
- 初始化 Express 应用
- 配置中间件（CORS, JSON 解析）
- 创建 MySQL 连接池
- 注册路由
- 启动 HTTP 服务器
```

### 2. auth.js - JWT 认证模块
```javascript
// 导出函数：
- generateToken(userId)      // 生成 JWT Token
- verifyToken(req, res, next) // Token 验证中间件
```

### 3. auth-routes.js - 认证路由
```javascript
POST /api/auth/register         // 用户注册
POST /api/auth/login            // 用户登录
POST /api/auth/forgot-password  // 忘记密码
POST /api/auth/reset-password   // 密码重置
```

### 4. users-routes.js - 用户路由
```javascript
GET  /api/users/profile             // 获取用户信息 [需要认证]
PUT  /api/users/profile             // 编辑用户信息 [需要认证]
PUT  /api/users/change-password     // 修改密码 [需要认证]
```

### 5. index.html - 前端应用
```javascript
Vue.js 应用包含 4 个主要页面：
- 登录页面    (login view)
- 注册页面    (register view)
- 忘记密码    (forgot password view)
- 用户主页    (profile view)

功能：
- 表单验证
- API 调用
- Token 管理
- 页面导航
- 错误处理
```

## 请求流程图

### 注册流程
```
[用户界面]
   ↓ 输入信息
[注册表单]
   ↓ 提交
[POST /api/auth/register]
   ↓
[auth-routes.js]
   ├─ 验证输入
   ├─ 检查用户存在
   ├─ 加密密码 (bcryptjs)
   └─ 保存到数据库
   ↓
[返回成功/错误]
   ↓
[显示提示信息]
```

### 登录流程
```
[登录表单]
   ↓
[POST /api/auth/login]
   ↓
[auth-routes.js]
   ├─ 查询用户
   ├─ 验证密码
   ├─ 生成 Token (JWT)
   └─ 返回 Token
   ↓
[前端接收 Token]
   ├─ 保存到 localStorage
   ├─ 设置 Authorization header
   └─ 跳转到主页
```

### API 调用流程
```
[前端代码]
   ↓ axios.get('/api/users/profile', {
   │    headers: { Authorization: 'Bearer token' }
   │  })
   ↓
[Express 路由处理]
   ↓ verifyToken 中间件
   ├─ 提取 Token
   ├─ 验证 JWT 签名
   ├─ 解析用户 ID
   └─ 传递给路由处理器
   ↓
[获取用户信息]
   ├─ 查询数据库
   ├─ 返回用户数据
   └─ 或返回错误
   ↓
[前端接收响应]
   ├─ 更新页面显示
   └─ 或显示错误提示
```

## 数据模型

### users 表
```sql
CREATE TABLE users (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  username        VARCHAR(50) UNIQUE NOT NULL,
  email           VARCHAR(100) UNIQUE NOT NULL,
  password        VARCHAR(255) NOT NULL,           -- bcryptjs 加密
  avatar          VARCHAR(500),                    -- 头像 URL
  bio             TEXT,                            -- 个人简介
  reset_token     VARCHAR(500),                    -- 重置密码 Token
  reset_expiry    DATETIME,                        -- Token 过期时间
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

索引:
- idx_email (email)
- idx_username (username)
- idx_reset_token (reset_token)
```

## 依赖包说明

| 包名 | 版本 | 用途 |
|------|------|------|
| express | ^4.18.2 | Web 框架 |
| mysql2 | ^3.6.0 | MySQL 驱动 |
| jsonwebtoken | ^9.0.2 | JWT 生成和验证 |
| bcryptjs | ^2.4.3 | 密码加密 |
| cors | ^2.8.5 | 跨域资源共享 |
| dotenv | ^16.3.1 | 环境变量管理 |
| nodemailer | ^6.9.6 | 邮件发送 (可选) |
| nodemon | ^3.0.1 | 开发工具 (自动重启) |

## 错误处理

### 常见错误和解决方案

#### 1. ECONNREFUSED - 数据库连接失败
```
原因: MySQL 服务未运行
解决: 启动 MySQL 服务
Windows: net start MySQL80
Linux: sudo service mysql start
```

#### 2. ER_NO_DB_ERROR - 数据库不存在
```
原因: 未运行初始化脚本
解决: mysql -u root -p < database.sql
```

#### 3. 401 Unauthorized - Token 无效
```
原因: 没有传递正确的 Token
解决: 确保在请求头中包含:
Authorization: Bearer {token}
```

#### 4. 密码验证失败
```
原因: bcryptjs 版本不匹配
解决: npm install bcryptjs@latest
```

## 扩展指南

### 添加邮件发送
```javascript
// 在 auth-routes.js 中修改 forgot-password 路由
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 发送邮件
await transporter.sendMail({
  to: email,
  subject: '密码重置',
  html: `点击链接重置密码: ...`
});
```

### 添加请求速率限制
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 最多100个请求
});

app.use('/api/', limiter);
```

### 添加日志记录
```javascript
const fs = require('fs');

function logRequest(method, path, status, userId) {
  const log = `${new Date().toISOString()} ${method} ${path} ${status} User:${userId}\n`;
  fs.appendFileSync('logs.txt', log);
}
```

### 添加邮箱验证
```javascript
// 在 users 表添加字段
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(500);

// 注册后发送验证邮件
```

## 调试技巧

### 1. 启用 SQL 日志
```javascript
// 在 server.js 中
pool.on('connection', (connection) => {
  console.log('📌 新数据库连接');
});
```

### 2. 打印 Token 内容
```javascript
// 在浏览器控制台
const token = localStorage.getItem('token');
console.log(JSON.parse(atob(token.split('.')[1])));
```

### 3. 监控 API 响应
```javascript
// 在 auth.js 中
console.log('🔍 验证 Token:', token);
console.log('👤 用户 ID:', decoded.userId);
```

### 4. 检查密码加密
```javascript
const bcrypt = require('bcryptjs');
const password = 'test123';
bcrypt.hash(password, 10, (err, hash) => {
  console.log('加密后:', hash);
});
```

## 测试计划

### 单元测试
```javascript
// 测试 JWT 生成
test('generateToken 应该返回有效的 Token', () => {
  const token = generateToken(1);
  expect(token).toBeDefined();
});

// 测试密码加密
test('bcryptjs 应该能加密和验证密码', async () => {
  const hash = await bcrypt.hash('password', 10);
  const match = await bcrypt.compare('password', hash);
  expect(match).toBe(true);
});
```

### 集成测试
```javascript
// 测试完整注册流程
test('注册应该成功并返回成功消息', async () => {
  const response = await axios.post('/api/auth/register', {
    username: 'test',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  });
  expect(response.data.success).toBe(true);
});
```

## 性能优化

1. **数据库优化**
   - 为常用字段添加索引
   - 使用连接池管理连接
   - 定期清理过期数据

2. **前端优化**
   - 缓存 Token 减少登录请求
   - 使用 CDN 加速资源加载
   - 压缩 CSS 和 JavaScript

3. **API 优化**
   - 实现缓存机制
   - 使用 Gzip 压缩
   - 添加速率限制

---

希望这个指南能帮助您更好地理解和使用这个登录系统！
