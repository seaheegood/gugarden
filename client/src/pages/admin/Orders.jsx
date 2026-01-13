import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const statusList = [
    { value: '', label: '전체' },
    { value: 'pending', label: '결제 대기' },
    { value: 'paid', label: '결제 완료' },
    { value: 'preparing', label: '준비중' },
    { value: 'shipped', label: '배송중' },
    { value: 'delivered', label: '배송 완료' },
    { value: 'cancelled', label: '취소' },
  ]

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/admin/orders?${params}`)
      setOrders(response.data.orders)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error('주문 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const openOrderDetail = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`)
      setSelectedOrder(response.data.order)
      setShowModal(true)
    } catch (error) {
      alert('주문 정보를 불러오는데 실패했습니다.')
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    if (!confirm(`주문 상태를 "${getStatusText(newStatus)}"(으)로 변경하시겠습니까?`)) return

    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })
      alert('주문 상태가 변경되었습니다.')
      fetchOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      alert(error.response?.data?.error || '상태 변경에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getStatusText = (status) => {
    const map = statusList.find((s) => s.value === status)
    return map ? map.label : status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      paid: 'bg-blue-500/20 text-blue-500',
      preparing: 'bg-purple-500/20 text-purple-500',
      shipped: 'bg-cyan-500/20 text-cyan-500',
      delivered: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-500'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-light tracking-[0.2em] mb-8">주문 관리</h1>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusList.map((status) => (
          <button
            key={status.value}
            onClick={() => {
              setStatusFilter(status.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className={`px-4 py-2 text-sm transition-colors ${
              statusFilter === status.value
                ? 'bg-white text-black'
                : 'border border-gray-700 text-gray-400 hover:border-white hover:text-white'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="bg-[#0a0a0a] border border-gray-800">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                  <th className="px-6 py-4 font-normal">주문번호</th>
                  <th className="px-6 py-4 font-normal">주문자</th>
                  <th className="px-6 py-4 font-normal">상품</th>
                  <th className="px-6 py-4 font-normal">금액</th>
                  <th className="px-6 py-4 font-normal">상태</th>
                  <th className="px-6 py-4 font-normal">일시</th>
                  <th className="px-6 py-4 font-normal">관리</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openOrderDetail(order.id)}
                          className="text-sm hover:text-gray-300"
                        >
                          {order.order_number}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{order.user_name}</p>
                        <p className="text-xs text-gray-500">{order.user_email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {order.item_count}개 상품
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ₩ {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="bg-black border border-gray-700 text-xs px-2 py-1 focus:outline-none focus:border-gray-500"
                        >
                          {statusList.slice(1).map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      주문이 없습니다.
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

      {/* 주문 상세 모달 */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-light tracking-wider">주문 상세</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 주문 상태 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="bg-black border border-gray-700 text-sm px-3 py-2 focus:outline-none"
                >
                  {statusList.slice(1).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 주문자 정보 */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">주문자 정보</h3>
                <div className="bg-black/50 p-4 space-y-2 text-sm">
                  <p>{selectedOrder.user_name} ({selectedOrder.user_email})</p>
                  <p className="text-gray-500">{selectedOrder.user_phone}</p>
                </div>
              </div>

              {/* 배송 정보 */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">배송 정보</h3>
                <div className="bg-black/50 p-4 space-y-2 text-sm">
                  <p>{selectedOrder.recipient_name} / {selectedOrder.recipient_phone}</p>
                  <p>{selectedOrder.recipient_address} {selectedOrder.recipient_address_detail}</p>
                  {selectedOrder.memo && (
                    <p className="text-gray-500">메모: {selectedOrder.memo}</p>
                  )}
                </div>
              </div>

              {/* 주문 상품 */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">주문 상품</h3>
                <div className="border border-gray-800 divide-y divide-gray-800">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4">
                      <div className="w-12 h-12 bg-gray-800 overflow-hidden flex-shrink-0">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.product_name}</p>
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

              {/* 결제 정보 */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">결제 정보</h3>
                <div className="bg-black/50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">상품 금액</span>
                    <span>₩ {formatPrice(selectedOrder.total_amount - selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">배송비</span>
                    <span>
                      {selectedOrder.shipping_fee === 0
                        ? '무료'
                        : `₩ ${formatPrice(selectedOrder.shipping_fee)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-800 text-base">
                    <span>총 결제 금액</span>
                    <span>₩ {formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-gray-500 text-xs">
                    <span>주문일시</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
