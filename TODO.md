# 구의정원 (gugarden) 개발 TODO

## 디자인 컨셉
- **메인 컬러**: 검정 (#000000, #1a1a1a)
- **서브 컬러**: 자연 사진을 배경으로 활용
- **스타일**: 미니멀, 우아함, 고급스러운 느낌
- **레퍼런스**: https://www.adana.co.jp/en/contents/products/index.html

## 상품 카테고리
1. 테라리움
2. 비바리움
3. 키트

## 추가 페이지
- 렌탈 서비스 페이지

---

## 개발 단계 개요

---

## 1단계: 프로젝트 초기 설정 ✅
- [x] 프로젝트 폴더 구조 생성
- [x] Frontend 초기화 (Vite + React + JavaScript)
- [x] TailwindCSS 설정
- [x] Backend 초기화 (Express)
- [x] MySQL 데이터베이스 스키마 설계
- [x] 환경변수 설정 (.env)

---

## 2단계: 기본 레이아웃 & 메인 페이지 ✅
- [x] 공통 레이아웃 컴포넌트 (Header, Footer)
- [x] 네비게이션 구조
- [x] 메인 페이지 (히어로 섹션, 상품 미리보기)
- [x] 렌탈 서비스 페이지
- [x] 상품 목록 페이지 (카테고리별)
- [x] 반응형 디자인 기본 설정

---

## 3단계: 상품 기능 ✅
- [x] 상품 테이블 생성 (MySQL) - schema.sql에 포함
- [x] 상품 CRUD API (Express)
- [x] 상품 목록 페이지 (Frontend)
- [x] 상품 상세 페이지 (Frontend)
- [x] 상품 이미지 업로드 기능

---

## 4단계: 사용자 인증 ✅
- [x] 사용자 테이블 생성 (MySQL) - schema.sql에 포함
- [x] 회원가입 API + 페이지
- [x] 로그인 API + 페이지 (JWT 발급)
- [x] JWT 인증 미들웨어
- [x] 비밀번호 암호화 (bcrypt)
- [x] 마이페이지 (정보수정, 주문내역, 비밀번호 변경)

---

## 5단계: 장바구니 & 주문 ✅
- [x] 장바구니 테이블 생성 - schema.sql에 포함
- [x] 장바구니 API (추가/삭제/조회/수량변경)
- [x] 장바구니 페이지
- [x] 주문 테이블 생성 - schema.sql에 포함
- [x] 주문 API (생성/조회/취소)
- [x] 주문/결제 페이지
- [x] 주문 완료/상세 페이지

---

## 6단계: 네이버페이 결제 연동 ✅
- [x] 네이버페이 API 키 발급 및 설정 (.env)
- [x] 결제 요청 API (server/routes/payments.js)
- [x] 결제 승인 콜백 처리
- [x] 결제 완료 페이지 (PaymentComplete.jsx)
- [x] 주문 상태 업데이트
- [x] 테스트 모드 지원 (API 키 없이도 동작)

---

## 7단계: 관리자 기능 ✅
- [x] 관리자 인증 (관리자 계정 구분)
- [x] 관리자 대시보드 (통계, 최근 주문)
- [x] 상품 관리 (추가/수정/삭제)
- [x] 주문 관리 (상태 변경)
- [x] 회원 관리 (역할 변경)

---

## 8단계: 마무리 & 배포
- [ ] 에러 핸들링 정리
- [ ] 보안 점검 (SQL Injection, XSS 등)
- [ ] Nginx 설정 (Reverse Proxy)
- [ ] SSL 인증서 설정
- [ ] gugarden.hongshin99.com 서브도메인 배포

---

## 폴더 구조 (예정)

```
gugarden/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── api/            # API 호출 함수
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── server/                 # Backend (Express)
│   ├── routes/             # API 라우트
│   ├── controllers/        # 비즈니스 로직
│   ├── middleware/         # 미들웨어 (인증 등)
│   ├── config/             # DB 설정 등
│   ├── app.js
│   └── server.js
│
├── database/               # DB 스키마, 마이그레이션
│   └── schema.sql
│
├── .env.example
├── TODO.md
└── README.md
```

---

## 현재 진행 상황

**현재 단계**: 7단계 완료 - 8단계 진행 대기
