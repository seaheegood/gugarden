import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api'

const categoryInfo = {
  terrarium: {
    title: 'TERRARIUM',
    subtitle: '밀폐된 유리 안의 작은 생태계',
    description: '테라리움은 밀폐된 유리 용기 안에서 자체적인 생태계를 형성하는 작은 정원입니다. 최소한의 관리로 자연의 아름다움을 오래도록 즐길 수 있습니다.',
  },
  vivarium: {
    title: 'VIVARIUM',
    subtitle: '살아있는 자연을 담은 공간',
    description: '비바리움은 식물과 동물이 함께 어우러진 살아있는 생태 공간입니다. 열대 우림부터 사막까지, 다양한 자연 환경을 재현합니다.',
  },
  kit: {
    title: 'KIT',
    subtitle: '직접 만드는 나만의 정원',
    description: '필요한 모든 재료가 포함된 DIY 키트로, 나만의 테라리움을 직접 만들어보세요. 상세한 설명서가 함께 제공됩니다.',
  },
}

function ProductList() {
  const location = useLocation()
  const category = location.pathname.replace('/', '')
  const [products, setProducts] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  const info = categoryInfo[category] || categoryInfo.terrarium

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/category/${category}`)
      setProducts(response.data.products)
    } catch (error) {
      console.error('상품 목록 조회 에러:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.sale_price || a.price) - (b.sale_price || b.price)
      case 'price-high':
        return (b.sale_price || b.price) - (a.sale_price || a.price)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="pt-20">
      {/* 히어로 섹션 */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(/images/${category}-hero.jpg)`,
              backgroundColor: '#111',
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.3em] mb-4">
            {info.title}
          </h1>
          <p className="text-gray-400">{info.subtitle}</p>
        </div>
      </section>

      {/* 소개 */}
      <section className="py-16 px-6 border-b border-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-500 leading-relaxed">{info.description}</p>
        </div>
      </section>

      {/* 상품 목록 */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 필터 & 정렬 */}
          <div className="flex justify-between items-center mb-12">
            <p className="text-sm text-gray-500">
              {loading ? '로딩 중...' : `${products.length}개의 상품`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-gray-800 px-4 py-2 text-sm focus:outline-none focus:border-gray-600"
            >
              <option value="newest">최신순</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
            </select>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-gray-500">상품을 불러오는 중...</p>
            </div>
          )}

          {/* 상품 그리드 */}
          {!loading && sortedProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {sortedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group block"
                >
                  <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden mb-4">
                    <img
                      src={product.thumbnail || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg'
                      }}
                    />
                    {product.sale_price && (
                      <span className="absolute top-3 left-3 bg-white text-black text-xs px-2 py-1">
                        SALE
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-light tracking-wider mb-2 group-hover:text-gray-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-sm">₩ {formatPrice(product.sale_price)}</span>
                        <span className="text-xs text-gray-600 line-through">
                          ₩ {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">₩ {formatPrice(product.price)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 상품이 없을 때 */}
          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">등록된 상품이 없습니다.</p>
              <Link to="/" className="text-sm text-gray-400 hover:text-white">
                홈으로 돌아가기
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProductList
