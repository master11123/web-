const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../auth');

// 获取用户信息
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const connection = await global.db.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, username, email, avatar, bio, updated_at FROM users WHERE id = ?',
      [req.userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    res.json({ 
      success: true, 
      data: users[0] 
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户信息失败' 
    });
  }
});

// 更新用户信息
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const connection = await global.db.getConnection();

    // 检查用户名是否已被使用
    if (username) {
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.userId]
      );

      if (existingUser.length > 0) {
        connection.release();
        return res.status(409).json({ 
          success: false, 
          message: '用户名已被使用' 
        });
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (bio) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (avatar) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: '没有要更新的字段' 
      });
    }

    updateValues.push(req.userId);

    await connection.query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    connection.release();

    res.json({ 
      success: true, 
      message: '用户信息已更新' 
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新失败' 
    });
  }
});

// 修改密码
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '所有字段都是必需的' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '两次输入的新密码不一致' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '新密码至少需要6个字符' 
      });
    }

    const connection = await global.db.getConnection();
    
    const [users] = await connection.query(
      'SELECT password FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password);

    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ 
        success: false, 
        message: '当前密码错误' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.userId]
    );

    connection.release();

    res.json({ 
      success: true, 
      message: '密码已修改' 
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '修改失败' 
    });
  }
});

module.exports = router;
