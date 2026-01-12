import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientZipcode: '',
    recipientAddress: '',
    recipientAddressDetail: '',
    memo: '',
    sameAsUser: false,
  })

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    if (user && formData.sameAsUser) {
      setFormData((prev) => ({
        ...prev,
        recipientName: user.name || '',
        recipientPhone: user.phone || '',
        recipientZipcode: user.zipcode || '',
        recipientAddress: user.address || '',
        recipientAddressDetail: user.address_detail || '',
      }))
    }
  }, [user, formData.sameAsUser])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      if (response.data.items.length === 0) {
        navigate('/cart')
        return
      }
      setItems(response.data.items)
      setTotalAmount(response.data.totalAmount)
    } catch (error) {
      console.error('장바구니 조회 에러:', error)
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.recipientName || !formData.recipientPhone || !formData.recipientAddress) {
      alert('배송 정보를 모두 입력해주세요.')
      return
    }

    setSubmitting(true)

    try {
      // 1. 주문 생성
      const orderResponse = await api.post('/orders', {
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientZipcode: formData.recipientZipcode,
        recipientAddress: formData.recipientAddress,
        recipientAddressDetail: formData.recipientAddressDetail,
        memo: formData.memo,
      })

      const orderId = orderResponse.data.orderId

      // 2. 결제 요청
      const paymentResponse = await api.post('/payments/prepare', { orderId })

      if (paymentResponse.data.testMode) {
        // 테스트 모드: 바로 결제 승인 처리
        const approveResponse = await api.post('/payments/approve', { orderId })

        if (approveResponse.data.success) {
          navigate(`/payment/complete?orderId=${orderId}`)
        } else {
          alert(approveResponse.data.error || '결제 승인에 실패했습니다.')
        }
      } else if (paymentResponse.data.paymentUrl) {
        // 실제 네이버페이 결제 페이지로 리다이렉트
        window.location.href = paymentResponse.data.paymentUrl
      } else {
        alert('결제 요청에 실패했습니다.')
      }
    } catch (error) {
      alert(error.response?.data?.error || '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const shippingFee = totalAmount >= 50000 ? 0 : 3000
  const finalAmount = totalAmount + shippingFee

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-light tracking-[0.2em] text-center mb-12">CHECKOUT</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* 배송 정보 */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-lg font-light tracking-wider mb-6">배송 정보</h2>

                <label className="flex items-center gap-2 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sameAsUser"
                    checked={formData.sameAsUser}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-400">회원 정보와 동일</span>
                </label>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 mb-2">
                      받는 분 *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 mb-2">
                      연락처 *
                    </label>
                    <input
                      type="tel"
                      name="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={handleChange}
                      required
                      placeholder="010-0000-0000"
                      className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 mb-2">
                      우편번호
                    </label>
                    <input
                      type="text"
                      name="recipientZipcode"
                      value={formData.recipientZipcode}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 mb-2">
                      주소 *
                    </label>
                    <input
                      type="text"
                      name="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 mb-2">
                      상세주소
                    </label>
                    <input
                      type="text"
                      name="recipientAddressDetail"
                      value={formData.recipientAddressDetail}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 mb-2">
                      배송 메모
                    </label>
                    <input
                      type="text"
                      name="memo"
                      value={formData.memo}
                      onChange={handleChange}
                      placeholder="배송 시 요청사항"
                      className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 결제 수단 */}
              <div>
                <h2 className="text-lg font-light tracking-wider mb-6">결제 수단</h2>
                <div className="p-4 border border-gray-800 bg-gray-900/50 flex items-center gap-4">
                  <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#03C75A] px-3 py-1.5 rounded">
                      <span className="text-white text-sm font-bold">N Pay</span>
                    </div>
                    <span className="text-sm text-gray-300">네이버페이</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  네이버페이로 간편하게 결제하세요.
                </p>
              </div>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 border border-gray-800 bg-[#0a0a0a]">
                <h2 className="text-lg font-light tracking-wider mb-6">주문 요약</h2>

                {/* 상품 목록 */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                        <img
                          src={item.thumbnail || '/images/placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          ₩ {formatPrice(item.sale_price || item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 금액 */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">상품 금액</span>
                    <span>₩ {formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">배송비</span>
                    <span>{shippingFee === 0 ? '무료' : `₩ ${formatPrice(shippingFee)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t border-gray-800">
                    <span>총 결제 금액</span>
                    <span>₩ {formatPrice(finalAmount)}</span>
                  </div>
                </div>

                {/* 결제 버튼 */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-white text-black text-sm tracking-[0.2em] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '처리 중...' : `₩ ${formatPrice(finalAmount)} 결제하기`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
