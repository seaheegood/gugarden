# 구의정원 (GUGARDEN) 배포 가이드

## 개요

- **웹서버**: Apache2
- **백엔드**: Node.js + Express (PM2로 프로세스 관리)
- **프론트엔드**: React (Vite 빌드)
- **데이터베이스**: MySQL 8.0 (외부 DB 서버)
- **SSL**: Let's Encrypt

---

## 1. 서버 환경 확인

```bash
# Node.js 버전 확인
node -v

# npm 버전 확인
npm -v

# MySQL 클라이언트 확인
mysql --version

# Apache 확인
apache2 -v
```

---

## 2. 필수 패키지 설치

```bash
# PM2 설치 (Node.js 프로세스 관리)
npm install -g pm2

# Apache 모듈 활성화
a2enmod proxy proxy_http rewrite headers
```

---

## 3. 데이터베이스 설정

```bash
# 외부 DB 서버에 접속하여 데이터베이스 생성
mysql -h [DB_HOST] -u[DB_USER] -p

# MySQL 접속 후
CREATE DATABASE IF NOT EXISTS gugarden
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

# 스키마 적용
mysql -h [DB_HOST] -u[DB_USER] -p gugarden < database/schema.sql
```

---

## 4. 프로젝트 배포

### 4.1 디렉토리 생성

```bash
mkdir -p /var/www/gugarden
```

### 4.2 클라이언트 빌드

```bash
# 로컬에서 빌드
cd client
npm run build
```

### 4.3 파일 업로드

```bash
# 서버 파일 업로드 (node_modules, .env 제외)
rsync -avz --exclude 'node_modules' --exclude '.env' \
  server/ user@server:/var/www/gugarden/server/

# 클라이언트 빌드 파일 업로드
rsync -avz client/dist/ user@server:/var/www/gugarden/client/

# 데이터베이스 스키마 업로드
rsync -avz database/ user@server:/var/www/gugarden/database/
```

### 4.4 서버에서 npm 패키지 설치

```bash
cd /var/www/gugarden/server
npm install
```

---

## 5. 환경변수 설정

`/var/www/gugarden/server/.env` 파일 생성:

```env
# 서버 설정
PORT=5000
NODE_ENV=production

# 데이터베이스 설정
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=gugarden

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 세션 설정
SESSION_SECRET=your_session_secret

# 네이버페이 설정
NAVERPAY_CLIENT_ID=
NAVERPAY_CLIENT_SECRET=
NAVERPAY_CHAIN_ID=

# 네이버 소셜 로그인
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_CALLBACK_URL=https://your-domain.com/api/auth/naver/callback

# 카카오 소셜 로그인
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_CALLBACK_URL=https://your-domain.com/api/auth/kakao/callback

# 토스페이먼츠
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 프론트엔드 URL
CLIENT_URL=https://your-domain.com
```

---

## 6. Apache 가상 호스트 설정

`/etc/apache2/sites-available/gugarden.conf` 파일 생성:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/gugarden/client

    <Directory /var/www/gugarden/client>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # API 프록시
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:5000/api
    ProxyPassReverse /api http://127.0.0.1:5000/api

    # 업로드 파일 프록시
    ProxyPass /uploads http://127.0.0.1:5000/uploads
    ProxyPassReverse /uploads http://127.0.0.1:5000/uploads

    # SPA 라우팅
    <Directory /var/www/gugarden/client>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/gugarden_error.log
    CustomLog ${APACHE_LOG_DIR}/gugarden_access.log combined
</VirtualHost>
```

### 사이트 활성화

```bash
a2ensite gugarden.conf
apache2ctl configtest
systemctl reload apache2
```

---

## 7. PM2로 Node.js 서버 실행

```bash
cd /var/www/gugarden/server

# 서버 시작
pm2 start server.js --name gugarden

# 프로세스 저장 (재부팅 시 자동 시작)
pm2 save

# 시스템 시작 시 PM2 자동 실행 설정
pm2 startup
```

### PM2 유용한 명령어

```bash
# 상태 확인
pm2 status

# 로그 보기
pm2 logs gugarden

# 서버 재시작
pm2 restart gugarden

# 서버 중지
pm2 stop gugarden
```

---

## 8. SSL 인증서 설치 (Let's Encrypt)

```bash
# Certbot 설치 (없는 경우)
apt install -y certbot python3-certbot-apache

# SSL 인증서 발급 및 자동 설정
certbot --apache -d your-domain.com --redirect
```

인증서는 자동으로 갱신됩니다 (90일마다).

---

## 9. 배포 후 확인

```bash
# API 헬스 체크
curl https://your-domain.com/api/health

# 예상 응답
# {"status":"ok","timestamp":"..."}
```

---

## 디렉토리 구조

```
/var/www/gugarden/
├── client/          # 프론트엔드 빌드 파일
│   ├── index.html
│   ├── assets/
│   └── images/
├── server/          # 백엔드 서버
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   └── uploads/
└── database/        # DB 스키마
    ├── schema.sql
    └── seed.sql
```

---

## 문제 해결

### PM2 로그 확인
```bash
pm2 logs gugarden --lines 50
```

### Apache 에러 로그 확인
```bash
tail -f /var/log/apache2/gugarden_error.log
```

### 서버 재시작
```bash
pm2 restart gugarden
systemctl reload apache2
```

### DB 연결 테스트
```bash
mysql -h [DB_HOST] -u[DB_USER] -p -e "SELECT 1"
```
