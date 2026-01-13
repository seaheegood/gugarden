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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const services = [
    { title: '기업 오피스', description: '업무 공간에 자연의 활력을 더해 직원들의 창의성과 생산성을 높입니다.', icon: '🏢' },
    { title: '카페 & 레스토랑', description: '고객에게 특별한 분위기를 선사하고 공간의 품격을 높입니다.', icon: '☕' },
    { title: '매장 & 쇼룸', description: '브랜드의 가치를 자연과 함께 표현하여 고객 경험을 향상시킵니다.', icon: '🏪' },
    { title: '호텔 & 리조트', description: '로비와 객실에 자연의 고요함을 담아 특별한 휴식 공간을 만듭니다.', icon: '🏨' },
  ]

  const process = [
    { step: '01', title: '상담 문의', description: '원하시는 공간과 스타일에 대해 상담합니다.' },
    { step: '02', title: '현장 방문', description: '공간을 직접 방문하여 환경을 분석합니다.' },
    { step: '03', title: '맞춤 제안', description: '공간에 최적화된 테라리움을 제안합니다.' },
    { step: '04', title: '설치 & 관리', description: '설치 후 정기적인 관리 서비스를 제공합니다.' },
  ]

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid #333', padding: '12px 16px', fontSize: '14px', color: '#fff' }

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* 히어로 섹션 */}
      <section style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#888', marginBottom: '24px' }}>FOR BUSINESS</p>
          <h1 style={{ fontSize: '48px', fontWeight: 200, letterSpacing: '0.2em', marginBottom: '24px' }}>RENTAL SERVICE</h1>
          <p style={{ color: '#888' }}>공간에 자연을 더하는 테라리움 렌탈 서비스</p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section style={{ padding: '100px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 200, marginBottom: '32px', lineHeight: 1.6 }}>
            비즈니스 공간에<br />자연의 감성을 더합니다
          </h2>
          <p style={{ color: '#888', lineHeight: 1.8 }}>
            구의정원의 렌탈 서비스는 기업, 카페, 매장 등 다양한 비즈니스 공간에
            맞춤형 테라리움을 제공합니다. 설치부터 정기 관리까지 전문가가 직접 케어합니다.
          </p>
        </div>
      </section>

      {/* 서비스 대상 */}
      <section style={{ padding: '80px 80px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#888', marginBottom: '16px' }}>SERVICE FOR</p>
            <h2 style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '0.15em' }}>이런 공간에 추천합니다</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {services.map((service, index) => (
              <div key={index} style={{ padding: '32px', border: '1px solid #333' }}>
                <div style={{ fontSize: '32px', marginBottom: '24px' }}>{service.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.1em', marginBottom: '16px' }}>{service.title}</h3>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 프로세스 */}
      <section style={{ padding: '100px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#888', marginBottom: '16px' }}>PROCESS</p>
            <h2 style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '0.15em' }}>렌탈 진행 과정</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            {process.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 200, color: '#666', marginBottom: '16px' }}>{item.step}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 300, marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 문의 폼 */}
      <section style={{ padding: '100px 80px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#888', marginBottom: '16px' }}>INQUIRY</p>
            <h2 style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '0.15em' }}>렌탈 문의하기</h2>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: '20px', fontWeight: 300, marginBottom: '16px' }}>문의가 접수되었습니다</p>
              <p style={{ color: '#888' }}>빠른 시일 내에 연락드리겠습니다.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이름 *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>회사명</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이메일 *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>연락처 *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>설치 위치</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="예: 서울시 강남구" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>공간 규모</label>
                  <input type="text" name="spaceSize" value={formData.spaceSize} onChange={handleChange} placeholder="예: 약 30평" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>문의 내용</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="원하시는 스타일이나 궁금한 점을 자유롭게 작성해주세요."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    border: '1px solid #fff',
                    background: 'transparent',
                    color: '#fff',
                    padding: '16px 48px',
                    fontSize: '12px',
                    letterSpacing: '0.3em',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1,
                  }}
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
