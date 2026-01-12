import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${id}`)
      setProduct(response.data.product)
    } catch (err) {
      setError('상품을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const handleAddToCart = async () => {
    try {
      await api.post('/cart', { productId: id, quantity })
      alert('장바구니에 추가되었습니다.')
    } catch (err) {
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.')
      } else {
        alert('장바구니 추가에 실패했습니다.')
      }
    }
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  // 이미지 배열 (썸네일 + 추가 이미지)
  const images = [
    product.thumbnail || '/images/placeholder.jpg',
    ...(product.images || []).map((img) => img.image_url)
  ]

  return (
    <div className="pt-20">
      {/* 브레드크럼 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="text-xs text-gray-500">
          <Link to="/" className="hover:text-white">HOME</Link>
          <span className="mx-2">/</span>
          <Link to={`/${product.category_slug}`} className="hover:text-white uppercase">
            {product.category_slug}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{product.name}</span>
        </nav>
      </div>

      {/* 상품 정보 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* 이미지 섹션 */}
          <div>
            {/* 메인 이미지 */}
            <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg'
                }}
              />
            </div>

            {/* 썸네일 리스트 */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 bg-[#1a1a1a] overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 정보 섹션 */}
          <div className="lg:py-4">
            {/* 카테고리 */}
            <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 uppercase">
              {product.category_name}
            </p>

            {/* 상품명 */}
            <h1 className="text-2xl md:text-3xl font-light tracking-wider mb-6">
              {product.name}
            </h1>

            {/* 가격 */}
            <div className="mb-8">
              {product.sale_price ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">₩ {formatPrice(product.sale_price)}</span>
                  <span className="text-lg text-gray-600 line-through">
                    ₩ {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl">₩ {formatPrice(product.price)}</span>
              )}
            </div>

            {/* 설명 */}
            {product.description && (
              <div className="mb-8 pb-8 border-b border-gray-800">
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* 수량 선택 */}
            <div className="mb-8">
              <label className="block text-xs tracking-wider text-gray-500 mb-3">
                수량
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 재고 상태 */}
            {product.stock !== undefined && (
              <p className="text-sm text-gray-500 mb-6">
                {product.stock > 0 ? `재고: ${product.stock}개` : '품절'}
              </p>
            )}

            {/* 버튼 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-4 border border-white text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                장바구니 담기
              </button>
              <button
                disabled={product.stock === 0}
                className="w-full py-4 bg-white text-black text-sm tracking-[0.2em] hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                바로 구매
              </button>
            </div>

            {/* 추가 정보 */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>배송</span>
                  <span>3,000원 (50,000원 이상 무료배송)</span>
                </div>
                <div className="flex justify-between">
                  <span>배송기간</span>
                  <span>주문 후 2-3일 이내</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상품 상세 설명 */}
      <section className="py-20 px-6 border-t border-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg tracking-wider mb-8 text-center">상품 상세</h2>
          <div className="text-gray-400 leading-loose">
            {product.description || '상품 상세 설명이 없습니다.'}
          </div>
        </div>
      </section>

      {/* 관련 상품 */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg tracking-wider mb-12 text-center">관련 상품</h2>
          <div className="text-center text-gray-500">
            관련 상품 준비 중...
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductDetail
