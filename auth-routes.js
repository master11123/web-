const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../auth');

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 验证输入
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '所有字段都是必需的' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '两次输入的密码不一致' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '密码至少需要6个字符' 
      });
    }

    const connection = await global.db.getConnection();
    
    // 检查用户是否已存在
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ 
        success: false, 
        message: '用户名或邮箱已被使用' 
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    await connection.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    connection.release();

    res.status(201).json({ 
      success: true, 
      message: '注册成功，请登录' 
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '注册失败' 
    });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱和密码是必需的' 
      });
    }

    const connection = await global.db.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, username, email, password FROM users WHERE email = ?',
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '邮箱或密码错误' 
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '邮箱或密码错误' 
      });
    }

    const token = generateToken(user.id);

    res.json({ 
      success: true, 
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '登录失败' 
    });
  }
});

// 忘记密码
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱是必需的' 
      });
    }

    const connection = await global.db.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        message: '找不到该邮箱的用户' 
      });
    }

    // 生成重置令牌
    const resetToken = generateToken(users[0].id);
    const resetExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1小时

    await connection.query(
      'UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?',
      [resetToken, resetExpiry, users[0].id]
    );

    connection.release();

    // 在生产环境中，应该通过邮件发送重置链接
    // 这里仅用于演示
    res.json({ 
      success: true, 
      message: '密码重置链接已发送到您的邮箱（演示环境）',
      resetToken: resetToken // 仅在开发环境显示
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '请求失败' 
    });
  }
});

// 重置密码
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '所有字段都是必需的' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '两次输入的密码不一致' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '密码至少需要6个字符' 
      });
    }

    const connection = await global.db.getConnection();
    
    // 验证重置令牌
    const [users] = await connection.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expiry > NOW()',
      [resetToken]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: '重置链接无效或已过期' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );

    connection.release();

    res.json({ 
      success: true, 
      message: '密码已重置，请使用新密码登录' 
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '重置失败' 
    });
  }
});

module.exports = router;
