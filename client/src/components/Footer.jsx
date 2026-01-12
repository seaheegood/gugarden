import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* 메인 푸터 */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 브랜드 */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-xl font-light tracking-[0.3em]">
              구의정원
            </Link>
            <p className="mt-6 text-sm text-gray-500 leading-relaxed">
              자연을 담은 작은 정원,<br />
              테라리움과 비바리움 전문 브랜드
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] text-gray-400 mb-6">
              SHOP
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terrarium"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Terrarium
                </Link>
              </li>
              <li>
                <Link
                  to="/vivarium"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Vivarium
                </Link>
              </li>
              <li>
                <Link
                  to="/kit"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Kit
                </Link>
              </li>
              <li>
                <Link
                  to="/rental"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Rental Service
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] text-gray-400 mb-6">
              SUPPORT
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] text-gray-400 mb-6">
              CONTACT
            </h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a
                  href="mailto:hello@gugarden.com"
                  className="hover:text-white transition-colors"
                >
                  hello@gugarden.com
                </a>
              </li>
              <li>
                <a
                  href="tel:02-0000-0000"
                  className="hover:text-white transition-colors"
                >
                  02-0000-0000
                </a>
              </li>
              <li className="pt-2">
                <p className="leading-relaxed">
                  서울특별시 광진구<br />
                  구의동 000-00
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="py-6 border-t border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              &copy; 2025 구의정원. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                to="/terms"
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
