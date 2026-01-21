const express = require('express')
const router = express.Router()
const axios = require('axios')
const crypto = require('crypto')
const pool = require('../config/db')
const auth = require('../middleware/auth')

// 네이버페이 API 설정
const NAVERPAY_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://dev.apis.naver.com'  // 실서비스는 dev를 api로 변경
  : 'https://dev.apis.naver.com'

const CLIENT_ID = process.env.NAVERPAY_CLIENT_ID
const CLIENT_SECRET = process.env.NAVERPAY_CLIENT_SECRET
const CHAIN_ID = process.env.NAVERPAY_CHAIN_ID

// 결제 예약 (주문 생성 후 결제 요청)
router.post('/prepare', auth, async (req, res) => {
  try {
    const { orderId } = req.body

    // 주문 정보 조회
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    if (order.status !== 'pending') {
      return res.status(400).json({ error: '이미 처리된 주문입니다.' })
    }

    // 주문 상품 조회
    const [items] = await pool.query(
      'SELECT product_name, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    )

    // 상품명 생성 (첫 번째 상품 외 n개)
    const productName = items.length > 1
      ? `${items[0].product_name} 외 ${items.length - 1}건`
      : items[0].product_name

    // 네이버페이 결제 요청 데이터
    const merchantPayKey = order.order_number
    const returnUrl = `${process.env.CLIENT_URL}/payment/complete?orderId=${orderId}`

    // 네이버페이 API 키가 설정되지 않은 경우 테스트 모드로 처리
    if (!CLIENT_ID || !CLIENT_SECRET) {
      // 테스트 모드: 바로 결제 완료 처리
      return res.json({
        success: true,
        testMode: true,
        message: '테스트 모드: 네이버페이 API 키가 설정되지 않았습니다.',
        orderId: orderId,
        orderNumber: order.order_number,
        totalAmount: order.total_amount
      })
    }

    // 네이버페이 결제 요청
    const paymentData = {
      merchantPayKey,
      productName,
      totalPayAmount: order.total_amount,
      taxScopeAmount: order.total_amount,
      taxExScopeAmount: 0,
      returnUrl
    }

    const timestamp = Date.now()
    const signature = generateSignature(timestamp, paymentData)

    const response = await axios.post(
      `${NAVERPAY_API_URL}/naverpay-partner/naverpay/payments/v2.2/reserve`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
          'X-NaverPay-Chain-Id': CHAIN_ID,
          'X-NaverPay-Idempotency-Key': merchantPayKey
        }
      }
    )

    if (response.data.code === 'Success') {
      // 결제 키 저장
      await pool.query(
        'UPDATE orders SET payment_key = ? WHERE id = ?',
        [response.data.body.paymentId, orderId]
      )

      res.json({
        success: true,
        paymentUrl: response.data.body.reserveId,
        paymentId: response.data.body.paymentId
      })
    } else {
      res.status(400).json({
        success: false,
        error: response.data.message || '결제 요청에 실패했습니다.'
      })
    }
  } catch (error) {
    console.error('결제 예약 에러:', error.response?.data || error.message)
    res.status(500).json({ error: '결제 요청에 실패했습니다.' })
  }
})

// 결제 승인
router.post('/approve', auth, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { orderId, paymentId } = req.body

    // 주문 정보 조회
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    // 테스트 모드 처리
    if (!CLIENT_ID || !CLIENT_SECRET) {
      // 테스트 모드: 바로 결제 완료 처리
      await connection.query(
        'UPDATE orders SET status = ?, paid_at = NOW() WHERE id = ?',
        ['paid', orderId]
      )

      await connection.commit()

      return res.json({
        success: true,
        testMode: true,
        message: '테스트 결제가 완료되었습니다.',
        orderId,
        orderNumber: order.order_number
      })
    }

    // 네이버페이 결제 승인 API 호출
    const response = await axios.post(
      `${NAVERPAY_API_URL}/naverpay-partner/naverpay/payments/v2.2/apply/payment`,
      { paymentId },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
          'X-NaverPay-Chain-Id': CHAIN_ID
        }
      }
    )

    if (response.data.code === 'Success') {
      // 주문 상태 업데이트
      await connection.query(
        'UPDATE orders SET status = ?, payment_key = ?, paid_at = NOW() WHERE id = ?',
        ['paid', paymentId, orderId]
      )

      await connection.commit()

      res.json({
        success: true,
        orderId,
        orderNumber: order.order_number,
        paymentId
      })
    } else {
      await connection.rollback()
      res.status(400).json({
        success: false,
        error: response.data.message || '결제 승인에 실패했습니다.'
      })
    }
  } catch (error) {
    await connection.rollback()
    console.error('결제 승인 에러:', error.response?.data || error.message)
    res.status(500).json({ error: '결제 승인에 실패했습니다.' })
  } finally {
    connection.release()
  }
})

// 결제 취소
router.post('/cancel', auth, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { orderId, reason } = req.body

    // 주문 정보 조회
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    if (order.status !== 'paid') {
      return res.status(400).json({ error: '결제된 주문만 취소할 수 있습니다.' })
    }

    // 테스트 모드 처리
    if (!CLIENT_ID || !CLIENT_SECRET) {
      // 재고 복구
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      )

      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }

      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      )

      await connection.commit()

      return res.json({
        success: true,
        testMode: true,
        message: '테스트 결제가 취소되었습니다.'
      })
    }

    // 네이버페이 결제 취소 API 호출
    const response = await axios.post(
      `${NAVERPAY_API_URL}/naverpay-partner/naverpay/payments/v1/cancel`,
      {
        paymentId: order.payment_key,
        cancelAmount: order.total_amount,
        cancelReason: reason || '고객 요청에 의한 취소'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
          'X-NaverPay-Chain-Id': CHAIN_ID
        }
      }
    )

    if (response.data.code === 'Success') {
      // 재고 복구
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      )

      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }

      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      )

      await connection.commit()

      res.json({
        success: true,
        message: '결제가 취소되었습니다.'
      })
    } else {
      await connection.rollback()
      res.status(400).json({
        success: false,
        error: response.data.message || '결제 취소에 실패했습니다.'
      })
    }
  } catch (error) {
    await connection.rollback()
    console.error('결제 취소 에러:', error.response?.data || error.message)
    res.status(500).json({ error: '결제 취소에 실패했습니다.' })
  } finally {
    connection.release()
  }
})

// 결제 상태 조회
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params

    const [orders] = await pool.query(
      'SELECT id, order_number, status, total_amount, paid_at FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    res.json({
      success: true,
      order: orders[0]
    })
  } catch (error) {
    console.error('결제 상태 조회 에러:', error)
    res.status(500).json({ error: '결제 상태 조회에 실패했습니다.' })
  }
})

// 서명 생성 (네이버페이 API 인증용)
function generateSignature(timestamp, data) {
  const message = `${timestamp}${JSON.stringify(data)}`
  return crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(message)
    .digest('base64')
}

// ==================== 토스페이먼츠 API ====================

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY
const TOSS_API_URL = 'https://api.tosspayments.com/v1'

// 토스페이먼츠 결제 준비
router.post('/toss/prepare', auth, async (req, res) => {
  try {
    const { orderId } = req.body

    // 주문 정보 조회
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    if (order.status !== 'pending') {
      return res.status(400).json({ error: '이미 처리된 주문입니다.' })
    }

    // 주문 상품 조회
    const [items] = await pool.query(
      'SELECT product_name, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    )

    // 상품명 생성
    const orderName = items.length > 1
      ? `${items[0].product_name} 외 ${items.length - 1}건`
      : items[0].product_name

    // 토스페이먼츠 API 키가 없으면 테스트 모드
    if (!TOSS_SECRET_KEY) {
      return res.json({
        success: true,
        testMode: true,
        message: '테스트 모드: 토스페이먼츠 API 키가 설정되지 않았습니다.',
        orderId: orderId,
        orderNumber: order.order_number,
        amount: order.total_amount,
        orderName
      })
    }

    // 클라이언트에서 사용할 결제 정보 반환
    res.json({
      success: true,
      orderId: orderId,
      orderNumber: order.order_number,
      amount: order.total_amount,
      orderName,
      customerName: order.recipient_name,
      customerEmail: req.user.email
    })
  } catch (error) {
    console.error('토스 결제 준비 에러:', error)
    res.status(500).json({ error: '결제 준비에 실패했습니다.' })
  }
})

// 토스페이먼츠 결제 승인
router.post('/toss/confirm', auth, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { orderId, paymentKey, amount } = req.body

    // 주문 정보 조회
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    // 금액 검증
    if (order.total_amount !== amount) {
      return res.status(400).json({ error: '결제 금액이 일치하지 않습니다.' })
    }

    // 테스트 모드 처리
    if (!TOSS_SECRET_KEY) {
      await connection.query(
        'UPDATE orders SET status = ?, payment_method = ?, payment_key = ?, paid_at = NOW() WHERE id = ?',
        ['paid', 'toss', paymentKey || 'test_payment', orderId]
      )

      await connection.commit()

      return res.json({
        success: true,
        testMode: true,
        message: '테스트 결제가 완료되었습니다.',
        orderId,
        orderNumber: order.order_number
      })
    }

    // 토스페이먼츠 결제 승인 API 호출
    const encryptedSecretKey = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')

    const response = await axios.post(
      `${TOSS_API_URL}/payments/confirm`,
      {
        paymentKey,
        orderId: order.order_number,
        amount
      },
      {
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.status === 'DONE') {
      // 주문 상태 업데이트
      await connection.query(
        'UPDATE orders SET status = ?, payment_method = ?, payment_key = ?, paid_at = NOW() WHERE id = ?',
        ['paid', 'toss', paymentKey, orderId]
      )

      await connection.commit()

      res.json({
        success: true,
        orderId,
        orderNumber: order.order_number,
        paymentKey
      })
    } else {
      await connection.rollback()
      res.status(400).json({
        success: false,
        error: '결제 승인에 실패했습니다.'
      })
    }
  } catch (error) {
    await connection.rollback()
    console.error('토스 결제 승인 에러:', error.response?.data || error.message)
    res.status(500).json({
      error: error.response?.data?.message || '결제 승인에 실패했습니다.'
    })
  } finally {
    connection.release()
  }
})

// 토스페이먼츠 결제 취소
router.post('/toss/cancel', auth, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { orderId, cancelReason } = req.body

    // 주문 정보 조회
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    )

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    if (order.status !== 'paid') {
      return res.status(400).json({ error: '결제된 주문만 취소할 수 있습니다.' })
    }

    // 테스트 모드 처리
    if (!TOSS_SECRET_KEY) {
      // 재고 복구
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      )

      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }

      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      )

      await connection.commit()

      return res.json({
        success: true,
        testMode: true,
        message: '테스트 결제가 취소되었습니다.'
      })
    }

    // 토스페이먼츠 결제 취소 API 호출
    const encryptedSecretKey = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')

    const response = await axios.post(
      `${TOSS_API_URL}/payments/${order.payment_key}/cancel`,
      {
        cancelReason: cancelReason || '고객 요청에 의한 취소'
      },
      {
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.status === 'CANCELED') {
      // 재고 복구
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      )

      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }

      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      )

      await connection.commit()

      res.json({
        success: true,
        message: '결제가 취소되었습니다.'
      })
    } else {
      await connection.rollback()
      res.status(400).json({
        success: false,
        error: '결제 취소에 실패했습니다.'
      })
    }
  } catch (error) {
    await connection.rollback()
    console.error('토스 결제 취소 에러:', error.response?.data || error.message)
    res.status(500).json({
      error: error.response?.data?.message || '결제 취소에 실패했습니다.'
    })
  } finally {
    connection.release()
  }
})

module.exports = router
