import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light tracking-[0.2em] mb-4">REGISTER</h1>
          <p className="text-sm text-gray-500">구의정원 회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

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
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-2">
              비밀번호 *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
              placeholder="6자 이상 입력해주세요"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-2">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </div>

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
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-2">
              연락처
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-800 px-4 py-3 text-sm focus:border-gray-600 focus:outline-none transition-colors"
              placeholder="010-0000-0000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black text-sm tracking-[0.2em] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'LOADING...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            이미 회원이신가요?{' '}
            <Link to="/login" className="text-white hover:text-gray-400 transition-colors">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
