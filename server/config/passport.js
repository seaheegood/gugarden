const passport = require('passport')
const NaverStrategy = require('passport-naver-v2').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const pool = require('./db')

// 세션에 사용자 정보 저장
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// 세션에서 사용자 정보 복원
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    done(null, users[0] || null)
  } catch (error) {
    done(error, null)
  }
})

// 네이버 로그인 전략
console.log('NAVER_CLIENT_ID:', process.env.NAVER_CLIENT_ID ? '설정됨' : '없음')
console.log('NAVER_CLIENT_SECRET:', process.env.NAVER_CLIENT_SECRET ? '설정됨' : '없음')
if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  console.log('네이버 로그인 전략 등록 중...')
  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CALLBACK_URL || 'http://localhost:5000/api/auth/naver/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, email, nickname, name, mobile, profile_image } = profile
      // name: 실명, nickname: 별명, mobile: 휴대전화번호
      const userName = name || nickname || email.split('@')[0]
      const userPhone = mobile || null

      // 기존 사용자 조회 (provider_id 또는 email로)
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE (provider = ? AND provider_id = ?) OR email = ?',
        ['naver', id, email]
      )

      if (existingUsers.length > 0) {
        const user = existingUsers[0]
        // 기존 local 계정이면 연동
        if (user.provider === 'local') {
          await pool.query(
            'UPDATE users SET provider = ?, provider_id = ?, profile_image = ?, phone = COALESCE(?, phone) WHERE id = ?',
            ['naver', id, profile_image, userPhone, user.id]
          )
        }
        return done(null, user)
      }

      // 새 사용자 생성
      const [result] = await pool.query(
        'INSERT INTO users (email, name, phone, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
        [email, userName, userPhone, 'naver', id, profile_image]
      )

      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
      done(null, newUser[0])
    } catch (error) {
      done(error, null)
    }
  }))
  console.log('네이버 로그인 전략 등록 완료')
} else {
  console.log('네이버 환경 변수 없음 - 네이버 로그인 비활성화')
}

// 카카오 로그인 전략
if (process.env.KAKAO_CLIENT_ID) {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackURL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:5000/api/auth/kakao/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, username, _json } = profile
      const email = _json.kakao_account?.email
      const nickname = username || _json.properties?.nickname
      const profile_image = _json.properties?.profile_image

      // 이메일이 없는 경우 처리
      const userEmail = email || `kakao_${id}@kakao.local`

      // 기존 사용자 조회 (provider_id 또는 email로)
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE (provider = ? AND provider_id = ?) OR email = ?',
        ['kakao', id.toString(), userEmail]
      )

      if (existingUsers.length > 0) {
        const user = existingUsers[0]
        // 기존 local 계정이면 연동
        if (user.provider === 'local' && email) {
          await pool.query(
            'UPDATE users SET provider = ?, provider_id = ?, profile_image = ? WHERE id = ?',
            ['kakao', id.toString(), profile_image, user.id]
          )
        }
        return done(null, user)
      }

      // 새 사용자 생성
      const [result] = await pool.query(
        'INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)',
        [userEmail, nickname || `user_${id}`, 'kakao', id.toString(), profile_image]
      )

      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
      done(null, newUser[0])
    } catch (error) {
      done(error, null)
    }
  }))
}

module.exports = passport
