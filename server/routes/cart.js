const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')

// 장바구니 조회
router.get('/', auth, async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.sale_price,
        p.thumbnail,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.is_active = true
      ORDER BY ci.created_at DESC
    `, [req.user.id])

    // 총 금액 계산
    const totalAmount = items.reduce((sum, item) => {
      const price = item.sale_price || item.price
      return sum + (price * item.quantity)
    }, 0)

    res.json({ items, totalAmount })
  } catch (error) {
    console.error('장바구니 조회 에러:', error)
    res.status(500).json({ error: '장바구니를 불러오는데 실패했습니다.' })
  }
})

// 장바구니 추가
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ error: '상품 ID가 필요합니다.' })
    }

    // 상품 존재 확인
    const [products] = await pool.query(
      'SELECT id, stock FROM products WHERE id = ? AND is_active = true',
      [productId]
    )

    if (products.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' })
    }

    // 이미 장바구니에 있는지 확인
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    )

    if (existing.length > 0) {
      // 수량 업데이트
      const newQuantity = existing[0].quantity + quantity
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      )
    } else {
      // 새로 추가
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      )
    }

    res.json({ message: '장바구니에 추가되었습니다.' })
  } catch (error) {
    console.error('장바구니 추가 에러:', error)
    res.status(500).json({ error: '장바구니 추가에 실패했습니다.' })
  }
})

// 장바구니 수량 변경
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: '유효하지 않은 수량입니다.' })
    }

    // 본인 장바구니인지 확인
    const [items] = await pool.query(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (items.length === 0) {
      return res.status(404).json({ error: '장바구니 항목을 찾을 수 없습니다.' })
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id])

    res.json({ message: '수량이 변경되었습니다.' })
  } catch (error) {
    console.error('수량 변경 에러:', error)
    res.status(500).json({ error: '수량 변경에 실패했습니다.' })
  }
})

// 장바구니 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params

    // 본인 장바구니인지 확인
    const [items] = await pool.query(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (items.length === 0) {
      return res.status(404).json({ error: '장바구니 항목을 찾을 수 없습니다.' })
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [id])

    res.json({ message: '삭제되었습니다.' })
  } catch (error) {
    console.error('장바구니 삭제 에러:', error)
    res.status(500).json({ error: '삭제에 실패했습니다.' })
  }
})

// 장바구니 전체 삭제
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
    res.json({ message: '장바구니가 비워졌습니다.' })
  } catch (error) {
    console.error('장바구니 전체 삭제 에러:', error)
    res.status(500).json({ error: '장바구니 비우기에 실패했습니다.' })
  }
})

module.exports = router
