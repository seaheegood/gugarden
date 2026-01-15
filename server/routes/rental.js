const express = require('express')
const router = express.Router()
const pool = require('../config/db')

// 렌탈 문의 제출 (공개 API)
router.post('/inquiry', async (req, res) => {
  try {
    const { name, email, phone, company, location, spaceSize, message } = req.body

    if (!name || !email || !phone) {
      return res.status(400).json({ error: '필수 정보를 입력해주세요.' })
    }

    const [result] = await pool.query(`
      INSERT INTO rental_inquiries (name, email, phone, company, location, space_size, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, email, phone, company || null, location || null, spaceSize || null, message || null])

    res.status(201).json({
      message: '렌탈 문의가 접수되었습니다.',
      inquiryId: result.insertId
    })
  } catch (error) {
    console.error('렌탈 문의 제출 에러:', error)
    res.status(500).json({ error: '문의 제출에 실패했습니다.' })
  }
})

module.exports = router
