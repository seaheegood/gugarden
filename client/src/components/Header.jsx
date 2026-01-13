import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // 히어로 섹션이 있는 페이지들 (투명 헤더 적용)
  const heroPages = ['/', '/terrarium', '/vivarium', '/kit', '/rental'];
  const hasHero = heroPages.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/terrarium", label: "TERRARIUM" },
    { to: "/vivarium", label: "VIVARIUM" },
    { to: "/kit", label: "KIT" },
    { to: "/rental", label: "RENTAL" },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: (hasHero && !isScrolled) ? '100px' : '70px',
        background: (hasHero && !isScrolled) ? 'transparent' : 'rgba(0,0,0,0.95)',
        backdropFilter: (hasHero && !isScrolled) ? 'none' : 'blur(10px)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 로고 */}
          <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
              <img
                src="/gugarden.png"
                alt="구의정원"
                style={{ height: '48px', width: 'auto', display: 'block' }}
              />
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.15em',
                  color: location.pathname === link.to ? '#fff' : '#888',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 유틸리티 메뉴 */}
          <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '32px' }}>
            <Link
              to="/cart"
              style={{ fontSize: '13px', letterSpacing: '0.1em', color: '#888' }}
            >
              CART
            </Link>
            {isAuthenticated ? (
              <Link
                to="/mypage"
                style={{ fontSize: '13px', letterSpacing: '0.1em', color: '#888' }}
              >
                {user?.name || "MY"}
              </Link>
            ) : (
              <Link
                to="/login"
                style={{ fontSize: '13px', letterSpacing: '0.1em', color: '#888' }}
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
