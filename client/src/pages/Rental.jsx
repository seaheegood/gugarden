import { useState } from 'react'

function Rental() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    spaceSize: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: API 연동
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)
  }

  const services = [
    {
      title: '기업 오피스',
      description: '업무 공간에 자연의 활력을 더해 직원들의 창의성과 생산성을 높입니다.',
      icon: '🏢',
    },
    {
      title: '카페 & 레스토랑',
      description: '고객에게 특별한 분위기를 선사하고 공간의 품격을 높입니다.',
      icon: '☕',
    },
    {
      title: '매장 & 쇼룸',
      description: '브랜드의 가치를 자연과 함께 표현하여 고객 경험을 향상시킵니다.',
      icon: '🏪',
    },
    {
      title: '호텔 & 리조트',
      description: '로비와 객실에 자연의 고요함을 담아 특별한 휴식 공간을 만듭니다.',
      icon: '🏨',
    },
  ]

  const process = [
    { step: '01', title: '상담 문의', description: '원하시는 공간과 스타일에 대해 상담합니다.' },
    { step: '02', title: '현장 방문', description: '공간을 직접 방문하여 환경을 분석합니다.' },
    { step: '03', title: '맞춤 제안', description: '공간에 최적화된 테라리움을 제안합니다.' },
    { step: '04', title: '설치 & 관리', description: '설치 후 정기적인 관리 서비스를 제공합니다.' },
  ]

  return (
    <div className="pt-20">
      {/* 히어로 섹션 */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/rental-hero.jpg)',
              backgroundColor: '#111',
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <p className="text-xs tracking-[0.4em] text-gray-400 mb-6">
            FOR BUSINESS
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extralight tracking-wider mb-6">
            RENTAL SERVICE
          </h1>
          <p className="text-gray-300 leading-relaxed">
            공간에 자연을 더하는 테라리움 렌탈 서비스
          </p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extralight tracking-wider leading-relaxed mb-8">
            비즈니스 공간에<br />
            자연의 감성을 더합니다
          </h2>
          <p className="text-gray-500 leading-loose">
            구의정원의 렌탈 서비스는 기업, 카페, 매장 등 다양한 비즈니스 공간에<br className="hidden md:block" />
            맞춤형 테라리움을 제공합니다. 설치부터 정기 관리까지<br className="hidden md:block" />
            전문가가 직접 케어합니다.
          </p>
        </div>
      </section>

      {/* 서비스 대상 */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">
              SERVICE FOR
            </p>
            <h2 className="text-2xl font-extralight tracking-[0.15em]">
              이런 공간에 추천합니다
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-8 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="text-3xl mb-6">{service.icon}</div>
                <h3 className="text-lg font-light tracking-wider mb-4">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 프로세스 */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">
              PROCESS
            </p>
            <h2 className="text-2xl font-extralight tracking-[0.15em]">
              렌탈 진행 과정
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-extralight text-gray-600 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-light tracking-wider mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 문의 폼 */}
      <section className="py-32 px-6 bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">
              INQUIRY
            </p>
            <h2 className="text-2xl font-extralight tracking-[0.15em]">
              렌탈 문의하기
            </h2>
          </div>

          {submitted ? (
            <div className="text-center py-16">
              <p className="text-xl font-light mb-4">문의가 접수되었습니다</p>
              <p className="text-gray-500">
                빠른 시일 내에 연락드리겠습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 mb-2">
                    회사명
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 mb-2">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 mb-2">
                    설치 위치
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="예: 서울시 강남구"
                    className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors placeholder:text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 mb-2">
                    공간 규모
                  </label>
                  <input
                    type="text"
                    name="spaceSize"
                    value={formData.spaceSize}
                    onChange={handleChange}
                    placeholder="예: 약 30평"
                    className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wider text-gray-400 mb-2">
                  문의 내용
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="원하시는 스타일이나 궁금한 점을 자유롭게 작성해주세요."
                  className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors resize-none placeholder:text-gray-700"
                />
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border border-white px-12 py-4 text-xs tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Rental
