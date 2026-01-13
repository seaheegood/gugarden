import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const menuItems = [
    { path: '/admin', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
    { path: '/admin/products', label: '상품 관리', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/admin/orders', label: '주문 관리', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/admin/users', label: '회원 관리', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-800">
          <NavLink to="/" className="text-xl tracking-[0.3em] font-light">
            GUGARDEN
          </NavLink>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단 정보 */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">{user.email}</p>
          <NavLink
            to="/"
            className="text-xs text-gray-400 hover:text-white mt-2 inline-block"
          >
            ← 사이트로 돌아가기
          </NavLink>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
