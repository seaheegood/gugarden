const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

// 모든 관리자 라우트에 인증 미들웨어 적용
router.use(auth)
router.use(adminAuth)

// =====================
// 대시보드 통계
// =====================
router.get('/dashboard', async (req, res) => {
  try {
    // 오늘 날짜
    const today = new Date().toISOString().split('T')[0]

    // 통계 쿼리 병렬 실행
    const [
      [totalOrders],
      [todayOrders],
      [totalRevenue],
      [todayRevenue],
      [totalUsers],
      [totalProducts],
      [pendingOrders],
      [recentOrders]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders WHERE status != "cancelled"'),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ? AND status != "cancelled"', [today]),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = "paid" OR status = "preparing" OR status = "shipped" OR status = "delivered"'),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE DATE(created_at) = ? AND status != "pending" AND status != "cancelled"', [today]),
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"'),
      pool.query(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `)
    ])

    res.json({
      stats: {
        totalOrders: totalOrders[0].count,
        todayOrders: todayOrders[0].count,
        totalRevenue: totalRevenue[0].total,
        todayRevenue: todayRevenue[0].total,
        totalUsers: totalUsers[0].count,
        totalProducts: totalProducts[0].count,
        pendingOrders: pendingOrders[0].count
      },
      recentOrders: recentOrders
    })
  } catch (error) {
    console.error('대시보드 조회 에러:', error)
    res.status(500).json({ error: '대시보드 정보를 불러오는데 실패했습니다.' })
  }
})

// =====================
// 주문 관리
// =====================

// 주문 목록 (페이지네이션)
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const status = req.query.status || ''

    let whereClause = ''
    let params = []

    if (status) {
      whereClause = 'WHERE o.status = ?'
      params.push(status)
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    )

    const [orders] = await pool.query(`
      SELECT
        o.*,
        u.name as user_name,
        u.email as user_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('주문 목록 조회 에러:', error)
    res.status(500).json({ error: '주문 목록을 불러오는데 실패했습니다.' })
  }
})

// 주문 상세
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [orders] = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id])

    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const [items] = await pool.query(`
      SELECT oi.*, p.thumbnail
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

// 주문 상태 변경
router.put('/orders/:id/status', async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다.' })
    }

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [id])
    if (orders.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }

    const order = orders[0]

    // 취소로 변경 시 재고 복구
    if (status === 'cancelled' && order.status !== 'cancelled') {
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
    }

    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id])

    await connection.commit()

    res.json({ message: '주문 상태가 변경되었습니다.', status })
  } catch (error) {
    await connection.rollback()
    console.error('주문 상태 변경 에러:', error)
    res.status(500).json({ error: '주문 상태 변경에 실패했습니다.' })
  } finally {
    connection.release()
  }
})

// =====================
// 상품 관리
// =====================

// 상품 목록 (관리자용)
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const category = req.query.category || ''
    const search = req.query.search || ''

    let whereClause = 'WHERE 1=1'
    let params = []

    if (category) {
      whereClause += ' AND c.slug = ?'
      params.push(category)
    }

    if (search) {
      whereClause += ' AND p.name LIKE ?'
      params.push(`%${search}%`)
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    )

    const [products] = await pool.query(`
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('상품 목록 조회 에러:', error)
    res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' })
  }
})

// 상품 생성
router.post('/products', async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      price,
      salePrice,
      stock,
      thumbnail,
      isActive,
      isFeatured
    } = req.body

    if (!categoryId || !name || !price) {
      return res.status(400).json({ error: '필수 정보를 입력해주세요.' })
    }

    // slug 생성
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now()

    const [result] = await pool.query(`
      INSERT INTO products (
        category_id, name, slug, description, price, sale_price,
        stock, thumbnail, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      categoryId, name, slug, description || null, price, salePrice || null,
      stock || 0, thumbnail || null, isActive !== false, isFeatured || false
    ])

    res.status(201).json({
      message: '상품이 등록되었습니다.',
      productId: result.insertId
    })
  } catch (error) {
    console.error('상품 생성 에러:', error)
    res.status(500).json({ error: '상품 등록에 실패했습니다.' })
  }
})

// 상품 수정
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      categoryId,
      name,
      description,
      price,
      salePrice,
      stock,
      thumbnail,
      isActive,
      isFeatured
    } = req.body

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' })
    }

    await pool.query(`
      UPDATE products SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = ?,
        price = COALESCE(?, price),
        sale_price = ?,
        stock = COALESCE(?, stock),
        thumbnail = ?,
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured)
      WHERE id = ?
    `, [
      categoryId, name, description, price, salePrice,
      stock, thumbnail, isActive, isFeatured, id
    ])

    res.json({ message: '상품이 수정되었습니다.' })
  } catch (error) {
    console.error('상품 수정 에러:', error)
    res.status(500).json({ error: '상품 수정에 실패했습니다.' })
  }
})

// 상품 삭제
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' })
    }

    // 주문된 상품인지 확인
    const [orderItems] = await pool.query(
      'SELECT id FROM order_items WHERE product_id = ? LIMIT 1',
      [id]
    )

    if (orderItems.length > 0) {
      // 주문 이력이 있으면 비활성화만
      await pool.query('UPDATE products SET is_active = false WHERE id = ?', [id])
      res.json({ message: '상품이 비활성화되었습니다. (주문 이력 존재)' })
    } else {
      // 주문 이력이 없으면 완전 삭제
      await pool.query('DELETE FROM products WHERE id = ?', [id])
      res.json({ message: '상품이 삭제되었습니다.' })
    }
  } catch (error) {
    console.error('상품 삭제 에러:', error)
    res.status(500).json({ error: '상품 삭제에 실패했습니다.' })
  }
})

// =====================
// 회원 관리
// =====================

// 회원 목록
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const search = req.query.search || ''

    let whereClause = ''
    let params = []

    if (search) {
      whereClause = 'WHERE name LIKE ? OR email LIKE ?'
      params.push(`%${search}%`, `%${search}%`)
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    )

    const [users] = await pool.query(`
      SELECT
        id, email, name, phone, role, created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = users.id AND status != 'cancelled') as total_spent
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('회원 목록 조회 에러:', error)
    res.status(500).json({ error: '회원 목록을 불러오는데 실패했습니다.' })
  }
})

// 회원 상세
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [users] = await pool.query(`
      SELECT id, email, name, phone, address, address_detail, zipcode, role, created_at
      FROM users WHERE id = ?
    `, [id])

    if (users.length === 0) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다.' })
    }

    // 주문 내역
    const [orders] = await pool.query(`
      SELECT id, order_number, total_amount, status, created_at
      FROM orders WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [id])

    res.json({
      user: users[0],
      orders
    })
  } catch (error) {
    console.error('회원 상세 조회 에러:', error)
    res.status(500).json({ error: '회원 정보를 불러오는데 실패했습니다.' })
  }
})

// 회원 역할 변경
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: '유효하지 않은 역할입니다.' })
    }

    // 자기 자신의 역할은 변경 불가
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: '자신의 역할은 변경할 수 없습니다.' })
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id])

    res.json({ message: '회원 역할이 변경되었습니다.' })
  } catch (error) {
    console.error('역할 변경 에러:', error)
    res.status(500).json({ error: '역할 변경에 실패했습니다.' })
  }
})

// =====================
// 카테고리 관리
// =====================

// 카테고리 목록
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.id
    `)

    res.json({ categories })
  } catch (error) {
    console.error('카테고리 조회 에러:', error)
    res.status(500).json({ error: '카테고리를 불러오는데 실패했습니다.' })
  }
})

module.exports = router
