# 구의정원 (gugarden)

테라리움 / 비바리움 작품 판매 웹사이트

## 기술 스택

### Frontend
- React + Vite
- JavaScript
- TailwindCSS
- Axios

### Backend
- Node.js + Express
- MySQL (mysql2)
- JWT 인증
- bcrypt

## 실행 방법

### 1. 데이터베이스 설정
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend 실행
```bash
cd server
cp .env.example .env  # 환경변수 설정
npm install
npm run dev
```

### 3. Frontend 실행
```bash
cd client
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 프로젝트 구조

```
gugarden/
├── client/          # Frontend (React)
├── server/          # Backend (Express)
├── database/        # DB 스키마
└── TODO.md          # 개발 진행 상황
```
