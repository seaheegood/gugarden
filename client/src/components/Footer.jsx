import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid #222' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 80px' }}>
        {/* 메인 푸터 */}
        <div style={{ padding: '80px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px' }}>
          {/* 브랜드 */}
          <div>
            <Link to="/" style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.3em' }}>
              구의정원
            </Link>
            <p style={{ marginTop: '24px', fontSize: '14px', color: '#888', lineHeight: 1.8 }}>
              자연을 담은 작은 정원,<br />
              테라리움과 비바리움 전문 브랜드
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <h4 style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#666', marginBottom: '24px' }}>
              SHOP
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link to="/terrarium" style={{ fontSize: '14px', color: '#888' }}>
                  Terrarium
                </Link>
              </li>
              <li>
                <Link to="/vivarium" style={{ fontSize: '14px', color: '#888' }}>
                  Vivarium
                </Link>
              </li>
              <li>
                <Link to="/kit" style={{ fontSize: '14px', color: '#888' }}>
                  Kit
                </Link>
              </li>
              <li>
                <Link to="/rental" style={{ fontSize: '14px', color: '#888' }}>
                  Rental Service
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h4 style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#666', marginBottom: '24px' }}>
              SUPPORT
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link to="/about" style={{ fontSize: '14px', color: '#888' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" style={{ fontSize: '14px', color: '#888' }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" style={{ fontSize: '14px', color: '#888' }}>
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ fontSize: '14px', color: '#888' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#666', marginBottom: '24px' }}>
              CONTACT
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#888' }}>
              <li>
                <a href="mailto:hello@gugarden.com">
                  hello@gugarden.com
                </a>
              </li>
              <li>
                <a href="tel:02-0000-0000">
                  02-0000-0000
                </a>
              </li>
              <li style={{ paddingTop: '8px', lineHeight: 1.6 }}>
                서울특별시 광진구<br />
                구의동 000-00
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div style={{ padding: '24px 0', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: '#555' }}>
            &copy; 2025 구의정원. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/privacy" style={{ fontSize: '12px', color: '#555' }}>
              개인정보처리방침
            </Link>
            <Link to="/terms" style={{ fontSize: '12px', color: '#555' }}>
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
