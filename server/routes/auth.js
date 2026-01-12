const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')
const auth = require('../middleware/auth')

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body

    // 유효성 검사
    if (!email || !password || !name) {
      return res.status(400).json({ error: '이메일, 비밀번호, 이름은 필수입니다.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
    }

    // 이메일 중복 체크
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' })
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, phone || null]
    )

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: result.insertId,
        email,
        name,
        role: 'user'
      }
    })
  } catch (error) {
    console.error('회원가입 에러:', error)
    res.status(500).json({ error: '회원가입에 실패했습니다.' })
  }
})

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' })
    }

    // 사용자 조회
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' })
    }

    const user = users[0]

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' })
    }

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('로그인 에러:', error)
    res.status(500).json({ error: '로그인에 실패했습니다.' })
  }
})

// 내 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, phone, address, address_detail, zipcode, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
    }

    res.json({ user: users[0] })
  } catch (error) {
    console.error('사용자 조회 에러:', error)
    res.status(500).json({ error: '사용자 정보를 불러오는데 실패했습니다.' })
  }
})

// 내 정보 수정
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address, address_detail, zipcode } = req.body

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, address = ?, address_detail = ?, zipcode = ? WHERE id = ?',
      [name, phone || null, address || null, address_detail || null, zipcode || null, req.user.id]
    )

    res.json({ message: '정보가 수정되었습니다.' })
  } catch (error) {
    console.error('정보 수정 에러:', error)
    res.status(500).json({ error: '정보 수정에 실패했습니다.' })
  }
})

// 비밀번호 변경
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
    }

    // 현재 비밀번호 확인
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id])
    const isMatch = await bcrypt.compare(currentPassword, users[0].password)

    if (!isMatch) {
      return res.status(400).json({ error: '현재 비밀번호가 일치하지 않습니다.' })
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id])

    res.json({ message: '비밀번호가 변경되었습니다.' })
  } catch (error) {
    console.error('비밀번호 변경 에러:', error)
    res.status(500).json({ error: '비밀번호 변경에 실패했습니다.' })
  }
})

module.exports = router
