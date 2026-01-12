import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setItems(response.data.items)
      setTotalAmount(response.data.totalAmount)
    } catch (error) {
      console.error('장바구니 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return

    try {
      await api.put(`/cart/${id}`, { quantity })
      fetchCart()
    } catch (error) {
      alert(error.response?.data?.error || '수량 변경에 실패했습니다.')
    }
  }

  const removeItem = async (id) => {
    if (!confirm('장바구니에서 삭제하시겠습니까?')) return

    try {
      await api.delete(`/cart/${id}`)
      fetchCart()
    } catch (error) {
      alert('삭제에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const shippingFee = totalAmount >= 50000 ? 0 : 3000
  const finalAmount = totalAmount + shippingFee

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 mb-6">로그인이 필요합니다.</p>
        <Link
          to="/login"
          className="border border-white px-8 py-3 text-sm tracking-wider hover:bg-white hover:text-black transition-colors"
        >
          로그인
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-light tracking-[0.2em] text-center mb-12">CART</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-8">장바구니가 비어있습니다.</p>
            <Link
              to="/terrarium"
              className="inline-block border border-gray-700 px-8 py-3 text-sm tracking-wider hover:border-white transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <>
            {/* 장바구니 목록 */}
            <div className="space-y-6 mb-12">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 p-6 border border-gray-800"
                >
                  {/* 이미지 */}
                  <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                    <div className="w-24 h-24 bg-[#1a1a1a] overflow-hidden">
                      <img
                        src={item.thumbnail || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${item.product_id}`}
                        className="text-sm font-light tracking-wider hover:text-gray-400"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        ₩ {formatPrice(item.sale_price || item.price)}
                      </p>
                    </div>

                    {/* 수량 & 삭제 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 소계 */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm">
                      ₩ {formatPrice((item.sale_price || item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="border-t border-gray-800 pt-8">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">상품 금액</span>
                  <span>₩ {formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">배송비</span>
                  <span>
                    {shippingFee === 0 ? (
                      '무료'
                    ) : (
                      `₩ ${formatPrice(shippingFee)}`
                    )}
                  </span>
                </div>
                {totalAmount < 50000 && (
                  <p className="text-xs text-gray-600">
                    ₩ {formatPrice(50000 - totalAmount)} 더 구매 시 무료배송
                  </p>
                )}
                <div className="flex justify-between text-lg pt-4 border-t border-gray-800">
                  <span>총 결제 금액</span>
                  <span>₩ {formatPrice(finalAmount)}</span>
                </div>
              </div>

              {/* 주문 버튼 */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-white text-black text-sm tracking-[0.2em] hover:bg-gray-200 transition-colors"
              >
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
