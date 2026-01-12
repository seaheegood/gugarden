import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

function OrderComplete() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data.order)
    } catch (error) {
      console.error('주문 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">주문 정보를 찾을 수 없습니다.</p>
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* 완료 메시지 */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-white rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-light tracking-[0.2em] mb-4">주문 완료</h1>
          <p className="text-gray-500">주문이 성공적으로 접수되었습니다.</p>
        </div>

        {/* 주문 정보 */}
        <div className="border border-gray-800 p-8 mb-8">
          <div className="text-center mb-8 pb-8 border-b border-gray-800">
            <p className="text-xs text-gray-500 mb-2">주문번호</p>
            <p className="text-lg tracking-wider">{order.order_number}</p>
          </div>

          {/* 주문 상품 */}
          <div className="mb-8">
            <h3 className="text-sm tracking-wider text-gray-400 mb-4">주문 상품</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product_name} x {item.quantity}
                  </span>
                  <span>₩ {formatPrice(item.product_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="mb-8">
            <h3 className="text-sm tracking-wider text-gray-400 mb-4">배송 정보</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>{order.recipient_name}</p>
              <p>{order.recipient_phone}</p>
              <p>
                {order.recipient_address}
                {order.recipient_address_detail && ` ${order.recipient_address_detail}`}
              </p>
              {order.memo && <p className="text-gray-500">메모: {order.memo}</p>}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="pt-6 border-t border-gray-800">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">상품 금액</span>
                <span>₩ {formatPrice(order.total_amount - order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">배송비</span>
                <span>
                  {order.shipping_fee === 0 ? '무료' : `₩ ${formatPrice(order.shipping_fee)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-4 border-t border-gray-800">
                <span>총 결제 금액</span>
                <span>₩ {formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/mypage"
            className="flex-1 py-4 border border-white text-center text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
          >
            주문 내역 보기
          </Link>
          <Link
            to="/"
            className="flex-1 py-4 bg-white text-black text-center text-sm tracking-[0.2em] hover:bg-gray-200 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderComplete
