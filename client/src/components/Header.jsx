import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

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
        padding: isScrolled ? '16px 0' : '28px 0',
        background: isScrolled ? 'rgba(0,0,0,0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 로고 */}
          <Link to="/" style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.3em' }}>
            구의정원
          </Link>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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
