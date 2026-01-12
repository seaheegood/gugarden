import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])

  const categories = [
    {
      to: '/terrarium',
      label: 'TERRARIUM',
      description: '밀폐된 유리 안의 작은 생태계',
      image: '/images/terrarium-thumb.jpg',
    },
    {
      to: '/vivarium',
      label: 'VIVARIUM',
      description: '살아있는 자연을 담은 공간',
      image: '/images/vivarium-thumb.jpg',
    },
    {
      to: '/kit',
      label: 'KIT',
      description: '직접 만드는 나만의 정원',
      image: '/images/kit-thumb.jpg',
    },
  ]

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured')
      setFeaturedProducts(response.data.products)
    } catch (error) {
      console.error('피처드 상품 조회 에러:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 배경 */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/hero-bg.jpg)',
              backgroundColor: '#111',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
        </div>

        {/* 콘텐츠 */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <p className="text-xs tracking-[0.4em] text-gray-400 mb-6">
            NATURE IN GLASS
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.2em] mb-6">
            구의정원
          </h1>
          <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed mb-10">
            자연을 담은 작은 정원
          </p>
          <Link
            to="/terrarium"
            className="inline-block border border-white/60 px-10 py-4 text-xs tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
          >
            EXPLORE
          </Link>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] text-gray-500 mb-8">ABOUT</p>
          <h2 className="text-2xl md:text-3xl font-extralight tracking-wider leading-relaxed mb-8">
            유리 안에 담긴 작은 생태계,<br />
            자연의 아름다움을 일상으로
          </h2>
          <p className="text-gray-500 leading-loose">
            구의정원은 테라리움과 비바리움을 통해<br className="hidden md:block" />
            도시 속에서도 자연과 함께하는 삶을 제안합니다.
          </p>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">
              COLLECTION
            </p>
            <h2 className="text-2xl font-extralight tracking-[0.15em]">
              OUR PRODUCTS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link key={cat.to} to={cat.to} className="group block">
                <div className="aspect-[3/4] relative overflow-hidden bg-[#1a1a1a]">
                  {/* 이미지 */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${cat.image})`,
                    }}
                  />
                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />
                  {/* 텍스트 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <h3 className="text-lg tracking-[0.3em] font-light mb-3">
                      {cat.label}
                    </h3>
                    <p className="text-sm text-gray-400 font-light">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 피처드 상품 섹션 */}
      <section className="py-32 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">
              FEATURED
            </p>
            <h2 className="text-2xl font-extralight tracking-[0.15em]">
              SELECTED WORKS
            </h2>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block">
                  <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden mb-4">
                    <img
                      src={product.thumbnail || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg'
                      }}
                    />
                  </div>
                  <h4 className="text-sm font-light tracking-wider mb-1 group-hover:text-gray-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ₩ {formatPrice(product.sale_price || product.price)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="block">
                  <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden mb-4" />
                  <div className="h-4 bg-[#1a1a1a] w-3/4 mb-2" />
                  <div className="h-3 bg-[#1a1a1a] w-1/2" />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              to="/terrarium"
              className="inline-block border border-gray-700 px-10 py-4 text-xs tracking-[0.3em] text-gray-400 hover:border-white hover:text-white transition-all duration-300"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* 렌탈 서비스 배너 */}
      <section className="relative py-40 px-6 overflow-hidden">
        {/* 배경 */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/rental-bg.jpg)',
              backgroundColor: '#111',
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* 콘텐츠 */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] text-gray-400 mb-6">
            FOR BUSINESS
          </p>
          <h2 className="text-3xl md:text-4xl font-extralight tracking-wider mb-6">
            RENTAL SERVICE
          </h2>
          <p className="text-gray-400 leading-relaxed mb-10">
            기업, 카페, 매장, 오피스 공간에<br />
            자연의 분위기를 더해보세요.
          </p>
          <Link
            to="/rental"
            className="inline-block border border-white/60 px-10 py-4 text-xs tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
          >
            LEARN MORE
          </Link>
        </div>
      </section>

      {/* 인스타그램 / 갤러리 섹션 */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">
              GALLERY
            </p>
            <h2 className="text-2xl font-extralight tracking-[0.15em]">
              FROM OUR STUDIO
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-[#1a1a1a] overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url(/images/gallery-${i}.jpg)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
