import { useState, useEffect } from 'react'
import api from '../../api'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [filter, setFilter] = useState({ category: '', search: '' })
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    thumbnail: '',
    isActive: true,
    isFeatured: false,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, filter.category])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('카테고리 조회 에러:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (filter.category) params.append('category', filter.category)
      if (filter.search) params.append('search', filter.search)

      const response = await api.get(`/admin/products?${params}`)
      setProducts(response.data.products)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error('상품 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchProducts()
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        categoryId: product.category_id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        salePrice: product.sale_price || '',
        stock: product.stock,
        thumbnail: product.thumbnail || '',
        isActive: product.is_active,
        isFeatured: product.is_featured,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        categoryId: categories[0]?.id || '',
        name: '',
        description: '',
        price: '',
        salePrice: '',
        stock: '',
        thumbnail: '',
        isActive: true,
        isFeatured: false,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.categoryId || !formData.name || !formData.price) {
      alert('필수 항목을 입력해주세요.')
      return
    }

    try {
      const data = {
        categoryId: parseInt(formData.categoryId),
        name: formData.name,
        description: formData.description || null,
        price: parseInt(formData.price),
        salePrice: formData.salePrice ? parseInt(formData.salePrice) : null,
        stock: parseInt(formData.stock) || 0,
        thumbnail: formData.thumbnail || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      }

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, data)
        alert('상품이 수정되었습니다.')
      } else {
        await api.post('/admin/products', data)
        alert('상품이 등록되었습니다.')
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.error || '저장에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.delete(`/admin/products/${id}`)
      alert('상품이 삭제되었습니다.')
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.error || '삭제에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-[0.2em]">상품 관리</h1>
        <button
          onClick={() => openModal()}
          className="px-6 py-2 bg-white text-black text-sm tracking-wider hover:bg-gray-200 transition-colors"
        >
          상품 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-[#0a0a0a] border border-gray-800 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <select
            value={filter.category}
            onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
            className="bg-black border border-gray-700 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="상품명 검색"
            className="flex-1 min-w-[200px] bg-black border border-gray-700 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />

          <button
            type="submit"
            className="px-6 py-2 border border-gray-700 text-sm hover:border-white transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 상품 목록 */}
      <div className="bg-[#0a0a0a] border border-gray-800">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                  <th className="px-6 py-4 font-normal">이미지</th>
                  <th className="px-6 py-4 font-normal">상품명</th>
                  <th className="px-6 py-4 font-normal">카테고리</th>
                  <th className="px-6 py-4 font-normal">가격</th>
                  <th className="px-6 py-4 font-normal">재고</th>
                  <th className="px-6 py-4 font-normal">상태</th>
                  <th className="px-6 py-4 font-normal">관리</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-gray-800 overflow-hidden">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{product.name}</p>
                        {product.is_featured && (
                          <span className="text-xs text-yellow-500">추천</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {product.category_name}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">₩ {formatPrice(product.price)}</p>
                        {product.sale_price && (
                          <p className="text-xs text-red-500">
                            ₩ {formatPrice(product.sale_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={product.stock < 5 ? 'text-red-500' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs ${
                            product.is_active ? 'text-green-500' : 'text-gray-500'
                          }`}
                        >
                          {product.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-xs text-red-500 hover:text-red-400"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      상품이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-800">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination((prev) => ({ ...prev, page }))}
                className={`w-8 h-8 text-sm ${
                  pagination.page === page
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 상품 등록/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-light tracking-wider">
                {editingProduct ? '상품 수정' : '상품 등록'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">카테고리 *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">상품명 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">정가 *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">할인가</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">재고</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">썸네일 URL</label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="/uploads/products/image.jpg"
                  className="w-full bg-black border border-gray-700 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-400">활성화</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-400">추천 상품</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-700 text-sm hover:border-white transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-black text-sm hover:bg-gray-200 transition-colors"
                >
                  {editingProduct ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
