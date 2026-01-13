import { useState, useEffect } from 'react'
import api from '../../api'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (search) params.append('search', search)

      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error('회원 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  const openUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      setSelectedUser(response.data.user)
      setUserOrders(response.data.orders)
      setShowModal(true)
    } catch (error) {
      alert('회원 정보를 불러오는데 실패했습니다.')
    }
  }

  const updateRole = async (userId, newRole) => {
    if (!confirm(`회원 역할을 "${newRole === 'admin' ? '관리자' : '일반 회원'}"(으)로 변경하시겠습니까?`)) {
      return
    }

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      alert('회원 역할이 변경되었습니다.')
      fetchUsers()
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }))
      }
    } catch (error) {
      alert(error.response?.data?.error || '역할 변경에 실패했습니다.')
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-light tracking-[0.2em] mb-8">회원 관리</h1>

      {/* 검색 */}
      <div className="bg-[#0a0a0a] border border-gray-800 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일로 검색"
            className="flex-1 bg-black border border-gray-700 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 border border-gray-700 text-sm hover:border-white transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 회원 목록 */}
      <div className="bg-[#0a0a0a] border border-gray-800">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                  <th className="px-6 py-4 font-normal">ID</th>
                  <th className="px-6 py-4 font-normal">이름</th>
                  <th className="px-6 py-4 font-normal">이메일</th>
                  <th className="px-6 py-4 font-normal">연락처</th>
                  <th className="px-6 py-4 font-normal">주문</th>
                  <th className="px-6 py-4 font-normal">총 구매액</th>
                  <th className="px-6 py-4 font-normal">역할</th>
                  <th className="px-6 py-4 font-normal">가입일</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                      <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openUserDetail(user.id)}
                          className="text-sm hover:text-gray-300"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">{user.order_count}건</td>
                      <td className="px-6 py-4 text-sm">₩ {formatPrice(user.total_spent)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className={`bg-black border text-xs px-2 py-1 focus:outline-none ${
                            user.role === 'admin'
                              ? 'border-yellow-500/50 text-yellow-500'
                              : 'border-gray-700 text-gray-400'
                          }`}
                        >
                          <option value="user">일반</option>
                          <option value="admin">관리자</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      회원이 없습니다.
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

      {/* 회원 상세 모달 */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-light tracking-wider">회원 상세</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">기본 정보</h3>
                <div className="bg-black/50 p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">이름</span>
                    <span>{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">이메일</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">연락처</span>
                    <span>{selectedUser.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">주소</span>
                    <span className="text-right">
                      {selectedUser.address
                        ? `${selectedUser.address} ${selectedUser.address_detail || ''}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">역할</span>
                    <span className={selectedUser.role === 'admin' ? 'text-yellow-500' : ''}>
                      {selectedUser.role === 'admin' ? '관리자' : '일반 회원'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">가입일</span>
                    <span>{formatDate(selectedUser.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* 최근 주문 */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">최근 주문 (최대 10건)</h3>
                {userOrders.length > 0 ? (
                  <div className="border border-gray-800 divide-y divide-gray-800">
                    {userOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-4 text-sm">
                        <div>
                          <p>{order.order_number}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p>₩ {formatPrice(order.total_amount)}</p>
                          <p className="text-xs text-gray-500">{getStatusText(order.status)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">주문 내역이 없습니다.</p>
                )}
              </div>

              {/* 역할 변경 */}
              <div className="flex gap-4 pt-4 border-t border-gray-800">
                {selectedUser.role === 'user' ? (
                  <button
                    onClick={() => updateRole(selectedUser.id, 'admin')}
                    className="flex-1 py-3 border border-yellow-500/50 text-yellow-500 text-sm hover:bg-yellow-500/10 transition-colors"
                  >
                    관리자로 변경
                  </button>
                ) : (
                  <button
                    onClick={() => updateRole(selectedUser.id, 'user')}
                    className="flex-1 py-3 border border-gray-700 text-gray-400 text-sm hover:border-white hover:text-white transition-colors"
                  >
                    일반 회원으로 변경
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
