# 구의정원 (GUGARDEN) 배포 가이드

## 개요

- **로컬 개발**: npm run dev (직접 실행)
- **서버 배포**: Docker + Docker Compose
- **배포 방식**: git pull 후 Docker 재시작

---

## 로컬 개발

```bash
# 클라이언트 (터미널 1)
cd client
npm install
npm run dev

# 서버 (터미널 2)
cd server
npm install
npm run dev
```

---

## 서버 배포

### 1. 서버 초기 설정 (최초 1회)

```bash
# 프로젝트 클론
cd /var/www
git clone https://github.com/your-username/gugarden.git
cd gugarden

# 환경변수 설정
cp server/.env.example server/.env
nano server/.env  # 값 입력
```

### 2. 환경변수 (.env)

`/var/www/gugarden/server/.env`:

```env
PORT=5000
NODE_ENV=production

# 데이터베이스
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=gugarden

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 세션
SESSION_SECRET=your_session_secret

# 소셜 로그인
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_CALLBACK_URL=https://your-domain.com/api/auth/naver/callback

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_CALLBACK_URL=https://your-domain.com/api/auth/kakao/callback

# 토스페이먼츠
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 프론트엔드 URL
CLIENT_URL=https://your-domain.com
```

### 3. 배포하기

```bash
# 1. 로컬에서 커밋 & 푸시
git add .
git commit -m "변경사항"
git push origin main

# 2. 서버 접속
ssh user@your-server

# 3. 코드 업데이트 & 재시작
cd /var/www/gugarden
git pull origin main
docker compose down
docker compose up -d --build
```

### 4. 빠른 배포 (스크립트)

서버에서 한 줄로 배포:

```bash
cd /var/www/gugarden && git pull && docker compose down && docker compose up -d --build
```

---

## Docker 명령어

```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f
docker compose logs -f server   # 서버만
docker compose logs -f client   # 클라이언트만

# 컨테이너 재시작
docker compose restart

# 컨테이너 중지
docker compose down

# 이미지 정리
docker image prune -f
```

---

## 문제 해결

### 로그 확인
```bash
docker compose logs -f server
```

### 컨테이너 내부 접속
```bash
docker exec -it gugarden-server sh
```

### 컨테이너 재빌드
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### DB 연결 테스트
```bash
mysql -h [DB_HOST] -u[DB_USER] -p -e "SELECT 1"
```
