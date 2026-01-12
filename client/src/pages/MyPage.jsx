import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function MyPage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    address_detail: '',
    zipcode: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        address_detail: user.address_detail || '',
        zipcode: user.zipcode || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders')
      setOrders(response.data.orders)
    } catch (error) {
      console.error('주문 목록 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      await api.put('/auth/me', profileData)
      updateUser(profileData)
      setMessage({ type: 'success', text: '정보가 수정되었습니다.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '정보 수정에 실패했습니다.' })
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' })
      return
    }

    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '비밀번호 변경에 실패했습니다.' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
      preparing: '상품 준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '주문 취소',
    }
    return statusMap[status] || status
  }

  const tabs = [
    { id: 'profile', label: '회원정보' },
    { id: 'orders', label: '주문내역' },
    { id: 'password', label: '비밀번호 변경' },
  ]

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-light tracking-[0.2em] text-center mb-12">MY PAGE</h1>

        {/* 탭 메뉴 */}
        <div className="flex justify-center gap-8 mb-12 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMessage({ type: '', text: '' })
              }}
              className={`pb-4 text-sm tracking-wider transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 메시지 */}
        {message.text && (
          <div
            className={`mb-8 p-4 text-sm text-center ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 회원정보 탭 */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">이메일</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">이름</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">연락처</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">우편번호</label>
              <input
                type="text"
                name="zipcode"
                value={profileData.zipcode}
                onChange={handleProfileChange}
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">주소</label>
              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleProfileChange}
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">상세주소</label>
              <input
                type="text"
                name="address_detail"
                value={profileData.address_detail}
                onChange={handleProfileChange}
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 border border-white text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                정보 수정
              </button>
            </div>
          </form>
        )}

        {/* 주문내역 탭 */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <p className="text-center text-gray-500 py-12">로딩 중...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">주문 내역이 없습니다.</p>
                <Link
                  to="/terrarium"
                  className="inline-block border border-gray-700 px-8 py-3 text-sm tracking-wider hover:border-white transition-colors"
                >
                  쇼핑하러 가기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{formatDate(order.created_at)}</p>
                        <p className="text-sm">주문번호: {order.order_number}</p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-gray-800">{getStatusText(order.status)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                      <p className="text-lg">₩ {formatPrice(order.total_amount)}</p>
                      <Link
                        to={`/order/${order.id}`}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        상세보기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 비밀번호 변경 탭 */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                placeholder="6자 이상"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-gray-400 mb-2">새 비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 border border-white text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                비밀번호 변경
              </button>
            </div>
          </form>
        )}

        {/* 로그아웃 버튼 */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyPage
