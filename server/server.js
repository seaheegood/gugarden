require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const session = require('express-session')
const passport = require('./config/passport')

const app = express()
const PORT = process.env.PORT || 5000

// 미들웨어
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 세션 설정 (소셜 로그인용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'gugarden-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}))

// Passport 초기화
app.use(passport.initialize())
app.use(passport.session())

// 정적 파일 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API 라우트
app.use('/api/products', require('./routes/products'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/rental', require('./routes/rental'))
app.use('/api/admin', require('./routes/admin'))

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '서버 에러가 발생했습니다.' })
})

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
})
