import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

function PaymentComplete() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  const resultCode = searchParams.get('resultCode')

  useEffect(() => {
    if (!orderId) {
      setStatus('error')
      setError('주문 정보가 없습니다.')
      return
    }

    processPayment()
  }, [orderId])

  const processPayment = async () => {
    try {
      // 결제 승인 요청
      const response = await api.post('/payments/approve', {
        orderId,
        paymentId
      })

      if (response.data.success) {
        setStatus('success')
        // 주문 정보 조회
        const orderResponse = await api.get(`/orders/${orderId}`)
        setOrder(orderResponse.data.order)
      } else {
        setStatus('error')
        setError(response.data.error || '결제 승인에 실패했습니다.')
      }
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error || '결제 처리 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  // 처리 중
  if (status === 'processing') {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-gray-400">결제를 처리하고 있습니다...</p>
        <p className="text-xs text-gray-600 mt-2">잠시만 기다려주세요.</p>
      </div>
    )
  }

  // 에러
  if (status === 'error') {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 mx-auto mb-6 border-2 border-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-light tracking-[0.2em] mb-4">결제 실패</h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <div className="flex gap-4">
          <Link
            to="/cart"
            className="px-8 py-3 border border-gray-700 text-sm tracking-[0.2em] hover:border-white transition-colors"
          >
            장바구니로
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-white text-black text-sm tracking-[0.2em] hover:bg-gray-200 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    )
  }

  // 성공
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
          <h1 className="text-2xl font-light tracking-[0.2em] mb-4">결제 완료</h1>
          <p className="text-gray-500">결제가 성공적으로 완료되었습니다.</p>
        </div>

        {order && (
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
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="pt-6 border-t border-gray-800">
              <div className="flex justify-between text-lg">
                <span>결제 금액</span>
                <span>₩ {formatPrice(order.total_amount)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">네이버페이로 결제되었습니다.</p>
            </div>
          </div>
        )}

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

export default PaymentComplete
