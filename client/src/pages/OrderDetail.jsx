import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  const handleCancel = async () => {
    if (!confirm('주문을 취소하시겠습니까?')) return

    try {
      await api.put(`/orders/${id}/cancel`)
      alert('주문이 취소되었습니다.')
      fetchOrder()
    } catch (error) {
      alert(error.response?.data?.error || '주문 취소에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: '결제 대기',
      paid: '결제 완료',
      preparing: '상품 준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '주문 취소',
    }
    return statusMap[status] || status
  }

  const canCancel = order && ['pending', 'paid'].includes(order.status)

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
        <Link to="/mypage" className="text-sm text-gray-400 hover:text-white">
          주문 내역으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            ← 뒤로가기
          </button>
          <span
            className={`text-xs px-3 py-1 ${
              order.status === 'cancelled' ? 'bg-red-900/50 text-red-400' : 'bg-gray-800'
            }`}
          >
            {getStatusText(order.status)}
          </span>
        </div>

        <h1 className="text-2xl font-light tracking-[0.2em] mb-2">주문 상세</h1>
        <p className="text-sm text-gray-500 mb-8">
          주문번호: {order.order_number}
        </p>

        {/* 주문 상품 */}
        <div className="border border-gray-800 mb-6">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-sm tracking-wider">주문 상품</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                <div className="w-16 h-16 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                  <img
                    src={item.thumbnail || '/images/placeholder.jpg'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-1">{item.product_name}</p>
                  <p className="text-xs text-gray-500">
                    ₩ {formatPrice(item.product_price)} x {item.quantity}
                  </p>
                </div>
                <div className="text-sm">
                  ₩ {formatPrice(item.product_price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="border border-gray-800 mb-6">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-sm tracking-wider">배송 정보</h2>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex">
              <span className="w-20 text-gray-500">받는 분</span>
              <span>{order.recipient_name}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-gray-500">연락처</span>
              <span>{order.recipient_phone}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-gray-500">주소</span>
              <span>
                {order.recipient_address}
                {order.recipient_address_detail && ` ${order.recipient_address_detail}`}
              </span>
            </div>
            {order.memo && (
              <div className="flex">
                <span className="w-20 text-gray-500">메모</span>
                <span>{order.memo}</span>
              </div>
            )}
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="border border-gray-800 mb-8">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-sm tracking-wider">결제 정보</h2>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">상품 금액</span>
              <span>₩ {formatPrice(order.total_amount - order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">배송비</span>
              <span>
                {order.shipping_fee === 0 ? '무료' : `₩ ${formatPrice(order.shipping_fee)}`}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-800 text-base">
              <span>총 결제 금액</span>
              <span>₩ {formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between pt-2 text-gray-500 text-xs">
              <span>주문일시</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          {canCancel && (
            <button
              onClick={handleCancel}
              className="flex-1 py-4 border border-gray-700 text-sm tracking-[0.2em] text-gray-400 hover:border-white hover:text-white transition-colors"
            >
              주문 취소
            </button>
          )}
          <Link
            to="/mypage"
            className="flex-1 py-4 bg-white text-black text-center text-sm tracking-[0.2em] hover:bg-gray-200 transition-colors"
          >
            주문 내역으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
