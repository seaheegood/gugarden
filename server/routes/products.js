const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')
const upload = require('../middleware/upload')

// 상품 목록 조회
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `)
    res.json({ products })
  } catch (error) {
    console.error('상품 목록 조회 에러:', error)
    res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' })
  }
})

// 카테고리별 상품 조회
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE c.slug = ? AND p.is_active = true
      ORDER BY p.created_at DESC
    `, [slug])
    res.json({ products })
  } catch (error) {
    console.error('카테고리별 상품 조회 에러:', error)
    res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' })
  }
})

// 피처드 상품 조회
router.get('/featured', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT 8
    `)
    res.json({ products })
  } catch (error) {
    console.error('피처드 상품 조회 에러:', error)
    res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' })
  }
})

// 상품 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 상품 정보
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = true
    `, [id])

    if (products.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' })
    }

    // 상품 이미지
    const [images] = await pool.query(`
      SELECT * FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC
    `, [id])

    res.json({
      product: {
        ...products[0],
        images
      }
    })
  } catch (error) {
    console.error('상품 상세 조회 에러:', error)
    res.status(500).json({ error: '상품 정보를 불러오는데 실패했습니다.' })
  }
})

// 상품 생성 (관리자 전용)
router.post('/', auth, adminAuth, upload.single('thumbnail'), async (req, res) => {
  try {
    const { category_id, name, slug, description, price, sale_price, stock, is_featured } = req.body
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null

    const [result] = await pool.query(`
      INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [category_id, name, slug, description, price, sale_price || null, stock || 0, thumbnail, is_featured || false])

    res.status(201).json({
      message: '상품이 등록되었습니다.',
      productId: result.insertId
    })
  } catch (error) {
    console.error('상품 생성 에러:', error)
    res.status(500).json({ error: '상품 등록에 실패했습니다.' })
  }
})

// 상품 수정 (관리자 전용)
router.put('/:id', auth, adminAuth, upload.single('thumbnail'), async (req, res) => {
  try {
    const { id } = req.params
    const { category_id, name, slug, description, price, sale_price, stock, is_active, is_featured } = req.body

    let query = `
      UPDATE products SET
        category_id = ?,
        name = ?,
        slug = ?,
        description = ?,
        price = ?,
        sale_price = ?,
        stock = ?,
        is_active = ?,
        is_featured = ?
    `
    let params = [category_id, name, slug, description, price, sale_price || null, stock, is_active, is_featured]

    if (req.file) {
      query += `, thumbnail = ?`
      params.push(`/uploads/${req.file.filename}`)
    }

    query += ` WHERE id = ?`
    params.push(id)

    await pool.query(query, params)

    res.json({ message: '상품이 수정되었습니다.' })
  } catch (error) {
    console.error('상품 수정 에러:', error)
    res.status(500).json({ error: '상품 수정에 실패했습니다.' })
  }
})

// 상품 삭제 (관리자 전용)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM products WHERE id = ?', [id])
    res.json({ message: '상품이 삭제되었습니다.' })
  } catch (error) {
    console.error('상품 삭제 에러:', error)
    res.status(500).json({ error: '상품 삭제에 실패했습니다.' })
  }
})

// 상품 이미지 추가 (관리자 전용)
router.post('/:id/images', auth, adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params
    const files = req.files

    if (!files || files.length === 0) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' })
    }

    const values = files.map((file, index) => [id, `/uploads/${file.filename}`, index])

    await pool.query(`
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES ?
    `, [values])

    res.status(201).json({ message: '이미지가 추가되었습니다.' })
  } catch (error) {
    console.error('이미지 추가 에러:', error)
    res.status(500).json({ error: '이미지 추가에 실패했습니다.' })
  }
})

// 상품 이미지 삭제 (관리자 전용)
router.delete('/images/:imageId', auth, adminAuth, async (req, res) => {
  try {
    const { imageId } = req.params
    await pool.query('DELETE FROM product_images WHERE id = ?', [imageId])
    res.json({ message: '이미지가 삭제되었습니다.' })
  } catch (error) {
    console.error('이미지 삭제 에러:', error)
    res.status(500).json({ error: '이미지 삭제에 실패했습니다.' })
  }
})

module.exports = router
