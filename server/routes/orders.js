const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')

// 주문번호 생성
function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `GG${year}${month}${day}${random}`
}

// 주문 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id])

    res.json({ orders })
  } catch (error) {
    console.error('주문 목록 조회 에러:', error)
    res.status(500).json({ error: '주문 목록을 불러오는데 실패했습니다.' })
  }
})

// 주문 상세 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params

    // 주문 정보
    const [orders] = await pool.query(`
      SELECT * FROM orders WHERE id = ? AND user_id = ?
    `, [id, req.user.id])

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    // 주문 상품
    const [items] = await pool.query(`
      SELECT
        oi.*,
        p.thumbnail
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id])

    res.json({
      order: {
        ...orders[0],
        items
      }
    })
  } catch (error) {
    console.error('주문 상세 조회 에러:', error)
    res.status(500).json({ error: '주문 정보를 불러오는데 실패했습니다.' })
  }
})

// 주문 생성
router.post('/', auth, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const {
      recipientName,
      recipientPhone,
      recipientAddress,
      recipientAddressDetail,
      recipientZipcode,
      memo,
      paymentMethod = 'naverpay'
    } = req.body

    // 유효성 검사
    if (!recipientName || !recipientPhone || !recipientAddress) {
      return res.status(400).json({ error: '배송 정보를 입력해주세요.' })
    }

    // 장바구니 조회
    const [cartItems] = await connection.query(`
      SELECT
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.sale_price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.is_active = true
    `, [req.user.id])

    if (cartItems.length === 0) {
      return res.status(400).json({ error: '장바구니가 비어있습니다.' })
    }

    // 재고 확인
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback()
        return res.status(400).json({
          error: `${item.name}의 재고가 부족합니다. (재고: ${item.stock}개)`
        })
      }
    }

    // 총 금액 계산
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.sale_price || item.price
      return sum + (price * item.quantity)
    }, 0)

    // 배송비 계산 (5만원 이상 무료)
    const shippingFee = totalAmount >= 50000 ? 0 : 3000

    // 주문 생성
    const orderNumber = generateOrderNumber()
    const [orderResult] = await connection.query(`
      INSERT INTO orders (
        user_id, order_number, total_amount, shipping_fee,
        recipient_name, recipient_phone, recipient_address,
        recipient_address_detail, recipient_zipcode, memo, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, orderNumber, totalAmount + shippingFee, shippingFee,
      recipientName, recipientPhone, recipientAddress,
      recipientAddressDetail || null, recipientZipcode || null, memo || null, paymentMethod
    ])

    const orderId = orderResult.insertId

    // 주문 상품 추가
    for (const item of cartItems) {
      const price = item.sale_price || item.price
      await connection.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.name, price, item.quantity])

      // 재고 차감
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      )
    }

    // 장바구니 비우기
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])

    await connection.commit()

    res.status(201).json({
      message: '주문이 생성되었습니다.',
      orderId,
      orderNumber,
      totalAmount: totalAmount + shippingFee
    })
  } catch (error) {
    await connection.rollback()
    console.error('주문 생성 에러:', error)
    res.status(500).json({ error: '주문 생성에 실패했습니다.' })
  } finally {
    connection.release()
  }
})

// 주문 취소
router.put('/:id/cancel', auth, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id } = req.params

    // 주문 확인
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    // 취소 가능 상태 확인
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ error: '취소할 수 없는 주문입니다.' })
    }

    // 재고 복구
    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    )

    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      )
    }

    // 주문 상태 변경
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['cancelled', id]
    )

    await connection.commit()

    res.json({ message: '주문이 취소되었습니다.' })
  } catch (error) {
    await connection.rollback()
    console.error('주문 취소 에러:', error)
    res.status(500).json({ error: '주문 취소에 실패했습니다.' })
  } finally {
    connection.release()
  }
})

module.exports = router
