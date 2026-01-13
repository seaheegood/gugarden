import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setData(response.data)
    } catch (error) {
      console.error('대시보드 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: '결제 대기',
      paid: '결제 완료',
      preparing: '준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '취소',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-500',
      paid: 'text-blue-500',
      preparing: 'text-purple-500',
      shipped: 'text-cyan-500',
      delivered: 'text-green-500',
      cancelled: 'text-red-500',
    }
    return colors[status] || 'text-gray-500'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  const { stats, recentOrders } = data || {}

  return (
    <div className="p-8">
      <h1 className="text-2xl font-light tracking-[0.2em] mb-8">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#0a0a0a] border border-gray-800 p-6">
          <p className="text-xs text-gray-500 mb-2">오늘 주문</p>
          <p className="text-3xl font-light">{stats?.todayOrders || 0}</p>
          <p className="text-xs text-gray-600 mt-2">전체 {stats?.totalOrders || 0}건</p>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 p-6">
          <p className="text-xs text-gray-500 mb-2">오늘 매출</p>
          <p className="text-3xl font-light">₩ {formatPrice(stats?.todayRevenue || 0)}</p>
          <p className="text-xs text-gray-600 mt-2">총 매출 ₩ {formatPrice(stats?.totalRevenue || 0)}</p>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 p-6">
          <p className="text-xs text-gray-500 mb-2">총 회원수</p>
          <p className="text-3xl font-light">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 p-6">
          <p className="text-xs text-gray-500 mb-2">등록 상품</p>
          <p className="text-3xl font-light">{stats?.totalProducts || 0}</p>
          {stats?.pendingOrders > 0 && (
            <p className="text-xs text-yellow-500 mt-2">대기 주문 {stats.pendingOrders}건</p>
          )}
        </div>
      </div>

      {/* 최근 주문 */}
      <div className="bg-[#0a0a0a] border border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-light tracking-wider">최근 주문</h2>
          <Link
            to="/admin/orders"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                <th className="px-6 py-4 font-normal">주문번호</th>
                <th className="px-6 py-4 font-normal">주문자</th>
                <th className="px-6 py-4 font-normal">금액</th>
                <th className="px-6 py-4 font-normal">상태</th>
                <th className="px-6 py-4 font-normal">일시</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-sm hover:text-gray-300"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {order.user_name || order.user_email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ₩ {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    주문 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
