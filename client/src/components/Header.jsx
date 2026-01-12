import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const navLinks = [
    { to: '/terrarium', label: 'TERRARIUM' },
    { to: '/vivarium', label: 'VIVARIUM' },
    { to: '/kit', label: 'KIT' },
    { to: '/rental', label: 'RENTAL' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-light tracking-[0.3em] hover:opacity-70 transition-opacity"
          >
            구의정원
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs tracking-[0.2em] transition-colors ${
                  location.pathname === link.to
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 유틸리티 메뉴 */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/cart"
              className="text-xs tracking-[0.15em] text-gray-400 hover:text-white transition-colors"
            >
              CART (0)
            </Link>
            {isAuthenticated ? (
              <Link
                to="/mypage"
                className="text-xs tracking-[0.15em] text-gray-400 hover:text-white transition-colors"
              >
                {user?.name || 'MY'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-xs tracking-[0.15em] text-gray-400 hover:text-white transition-colors"
              >
                LOGIN
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-[1px] bg-white transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''
                }`}
              />
              <span
                className={`block h-[1px] bg-white transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-[1px] bg-white transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div
        className={`lg:hidden fixed inset-0 top-[60px] bg-black/98 transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8 -mt-20">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-lg tracking-[0.3em] transition-colors ${
                location.pathname === link.to
                  ? 'text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 pt-8 border-t border-gray-800 flex gap-10">
            <Link
              to="/cart"
              className="text-sm tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
            >
              CART
            </Link>
            {isAuthenticated ? (
              <Link
                to="/mypage"
                className="text-sm tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
              >
                MY PAGE
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
              >
                LOGIN
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
