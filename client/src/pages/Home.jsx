import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])

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
      {/* 히어로 */}
      <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.4em', color: '#888', marginBottom: '24px' }}>Nature in Glass</p>
          <h1 style={{ fontSize: '48px', fontWeight: 200, letterSpacing: '0.2em', marginBottom: '16px' }}>구의정원</h1>
          <p style={{ color: '#888', marginBottom: '48px' }}>자연을 담은 작은 정원</p>
          <Link to="/terrarium" style={{ border: '1px solid #666', padding: '12px 40px', fontSize: '11px', letterSpacing: '0.2em' }}>
            EXPLORE
          </Link>
        </div>
      </section>

      {/* 소개 */}
      <section style={{ padding: '100px 80px', background: '#000' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 200, marginBottom: '24px', lineHeight: 1.6 }}>
            유리 안에 담긴 작은 생태계,<br />자연의 아름다움을 일상으로
          </h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            구의정원은 테라리움과 비바리움을 통해 도시 속에서도 자연과 함께하는 삶을 제안합니다.
          </p>
        </div>
      </section>

      {/* 카테고리 */}
      <section style={{ padding: '0 80px 100px', background: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#666', marginBottom: '12px' }}>Products</p>
          <h2 style={{ fontSize: '24px', fontWeight: 200, marginBottom: '48px' }}>Our Collection</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <Link to="/terrarium" style={{ display: 'block' }}>
              <div style={{ aspectRatio: '4/3', background: '#1a1a1a', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Terrarium</h3>
              <p style={{ fontSize: '12px', color: '#888' }}>밀폐된 유리 안의 작은 생태계</p>
            </Link>
            <Link to="/vivarium" style={{ display: 'block' }}>
              <div style={{ aspectRatio: '4/3', background: '#1a1a1a', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Vivarium</h3>
              <p style={{ fontSize: '12px', color: '#888' }}>살아있는 자연을 담은 공간</p>
            </Link>
            <Link to="/kit" style={{ display: 'block' }}>
              <div style={{ aspectRatio: '4/3', background: '#1a1a1a', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Kit</h3>
              <p style={{ fontSize: '12px', color: '#888' }}>직접 만드는 나만의 정원</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 피처드 상품 */}
      <section style={{ padding: '100px 80px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#666', marginBottom: '12px' }}>Featured</p>
          <h2 style={{ fontSize: '24px', fontWeight: 200, marginBottom: '48px' }}>Selected Products</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} style={{ display: 'block' }}>
                  <div style={{ aspectRatio: '1/1', background: '#1a1a1a', marginBottom: '12px' }}>
                    {product.thumbnail && (
                      <img src={product.thumbnail} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{product.name}</h4>
                  <p style={{ fontSize: '12px', color: '#888' }}>₩ {formatPrice(product.sale_price || product.price)}</p>
                </Link>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div style={{ aspectRatio: '1/1', background: '#1a1a1a', marginBottom: '12px' }} />
                  <div style={{ height: '16px', background: '#1a1a1a', width: '75%', marginBottom: '8px' }} />
                  <div style={{ height: '12px', background: '#1a1a1a', width: '50%' }} />
                </div>
              ))
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <Link to="/terrarium" style={{ border: '1px solid #444', padding: '12px 40px', fontSize: '11px', letterSpacing: '0.2em', color: '#888' }}>
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* 렌탈 */}
      <section style={{ padding: '100px 80px', background: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div style={{ aspectRatio: '4/3', background: '#1a1a1a' }} />
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#666', marginBottom: '12px' }}>For Business</p>
            <h2 style={{ fontSize: '24px', fontWeight: 200, marginBottom: '24px' }}>Rental Service</h2>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.8, marginBottom: '32px' }}>
              기업, 카페, 매장, 오피스 공간에 자연의 분위기를 더해보세요.
              정기적인 관리 서비스와 함께 공간에 맞는 맞춤 테라리움을 제안합니다.
            </p>
            <Link to="/rental" style={{ border: '1px solid #444', padding: '12px 32px', fontSize: '11px', letterSpacing: '0.2em', color: '#888' }}>
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section style={{ padding: '100px 80px', background: '#0a0a0a', borderTop: '1px solid #222' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '64px' }}>
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Handcrafted</h3>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>모든 작품은 장인의 손으로 하나하나 정성껏 제작됩니다.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Safe Delivery</h3>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>안전한 포장과 신속한 배송으로 완벽하게 전달합니다.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Care Guide</h3>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>상세한 관리 가이드와 지속적인 케어 상담을 제공합니다.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
