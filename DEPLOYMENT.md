# 구의정원 (GUGARDEN) 배포 가이드

## 개요

- **컨테이너**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **웹서버**: Nginx (Docker 컨테이너)
- **백엔드**: Node.js + Express (Docker 컨테이너)
- **데이터베이스**: MySQL 8.0 (외부 DB 서버)
- **SSL**: Let's Encrypt (외부 리버스 프록시에서 처리)

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│  (main → Production, develop → Staging 자동 배포)        │
└─────────────────────────┬───────────────────────────────┘
                          │ SSH
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      서버                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Docker Compose                      │    │
│  │  ┌───────────────┐    ┌───────────────────┐     │    │
│  │  │  Nginx        │    │  Node.js Server   │     │    │
│  │  │  (Client)     │───▶│  (API)            │     │    │
│  │  │  Port: 3000   │    │  Port: 5000       │     │    │
│  │  └───────────────┘    └───────────────────┘     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  MySQL 8.0  │
                   │  (외부 DB)   │
                   └─────────────┘
```

---

## 1. 사전 요구사항

### 서버 환경

```bash
# Docker 설치 확인
docker --version

# Docker Compose 설치 확인
docker compose version

# Git 설치 확인
git --version
```

### GitHub Secrets 설정

GitHub 리포지토리 설정에서 다음 Secrets를 추가:

| Secret 이름 | 설명 |
|------------|------|
| `SERVER_HOST` | 배포 서버 IP 또는 도메인 |
| `SERVER_USER` | SSH 접속 사용자명 |
| `SSH_PRIVATE_KEY` | SSH 개인키 |
| `DOMAIN` | 서비스 도메인 (헬스체크용) |

---

## 2. 자동 배포 (GitHub Actions)

### Production 배포

- **트리거**: `main` 브랜치에 push
- **배포 경로**: `/var/www/gugarden`

```bash
# main 브랜치에 push하면 자동 배포
git push origin main
```

### Staging 배포

- **트리거**: `develop` 브랜치에 push
- **배포 경로**: `/var/www/gugarden-staging`

```bash
# develop 브랜치에 push하면 자동 배포
git push origin develop
```

### 수동 배포

GitHub Actions 페이지에서 "Run workflow" 버튼으로 수동 실행 가능

---

## 3. 수동 배포 (스크립트 사용)

서버에 직접 접속하여 배포할 경우:

```bash
# Production 배포
./scripts/deploy.sh production

# Staging 배포
./scripts/deploy.sh staging
```

---

## 4. 서버 초기 설정

### 4.1 디렉토리 생성 및 클론

```bash
# Production
mkdir -p /var/www/gugarden
cd /var/www/gugarden
git clone https://github.com/your-username/gugarden.git .

# Staging
mkdir -p /var/www/gugarden-staging
cd /var/www/gugarden-staging
git clone -b develop https://github.com/your-username/gugarden.git .
```

### 4.2 환경변수 설정

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

### 4.3 데이터베이스 초기화

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

## 5. Docker 컨테이너 관리

### 컨테이너 시작

```bash
cd /var/www/gugarden
docker compose up -d
```

### 컨테이너 중지

```bash
docker compose down
```

### 컨테이너 재빌드

```bash
docker compose build --no-cache
docker compose up -d
```

### 로그 확인

```bash
# 모든 컨테이너 로그
docker compose logs -f

# 서버 로그만
docker compose logs -f server

# 클라이언트 로그만
docker compose logs -f client
```

### 컨테이너 상태 확인

```bash
docker compose ps
```

---

## 6. 디렉토리 구조

```
/var/www/gugarden/
├── .github/
│   └── workflows/
│       ├── deploy.yml         # Production 배포 워크플로우
│       └── staging.yml        # Staging 배포 워크플로우
├── client/
│   ├── Dockerfile             # 프론트엔드 Docker 이미지
│   ├── nginx.conf             # Nginx 설정
│   └── ...
├── server/
│   ├── Dockerfile             # 백엔드 Docker 이미지
│   ├── .env                   # 환경변수 (Git 제외)
│   ├── uploads/               # 업로드 파일 (볼륨 마운트)
│   └── ...
├── database/
│   ├── schema.sql
│   └── seed.sql
├── scripts/
│   └── deploy.sh              # 수동 배포 스크립트
├── docker-compose.yml         # 개발/기본 설정
└── docker-compose.prod.yml    # 프로덕션 설정
```

---

## 7. 헬스 체크

```bash
# API 헬스 체크
curl http://localhost:3000/api/health

# 예상 응답
# {"status":"ok","timestamp":"..."}
```

---

## 8. 문제 해결

### Docker 로그 확인

```bash
# 서버 로그
docker compose logs -f server

# Nginx 로그
docker compose logs -f client
```

### 컨테이너 내부 접속

```bash
# 서버 컨테이너
docker exec -it gugarden-server sh

# 클라이언트 컨테이너
docker exec -it gugarden-client sh
```

### 컨테이너 재시작

```bash
docker compose restart server
docker compose restart client
```

### 이미지 정리

```bash
# 사용하지 않는 이미지 삭제
docker image prune -f

# 모든 미사용 리소스 정리
docker system prune -f
```

### DB 연결 테스트

```bash
mysql -h [DB_HOST] -u[DB_USER] -p -e "SELECT 1"
```

---

## 9. 롤백

문제 발생 시 이전 버전으로 롤백:

```bash
cd /var/www/gugarden

# 이전 커밋으로 체크아웃
git log --oneline -10  # 최근 커밋 확인
git checkout <commit-hash>

# 컨테이너 재빌드
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 10. SSL 설정

외부 리버스 프록시(Apache/Nginx)에서 SSL 처리를 담당합니다.

### Let's Encrypt 인증서 발급 (서버에서)

```bash
# Certbot 설치
apt install -y certbot

# 인증서 발급
certbot certonly --standalone -d your-domain.com

# 인증서 자동 갱신 확인
certbot renew --dry-run
```

### 외부 Apache 프록시 설정 예시

```apache
<VirtualHost *:443>
    ServerName your-domain.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```
