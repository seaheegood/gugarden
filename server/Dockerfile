# Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 복사
COPY . .

# 업로드 디렉토리 생성
RUN mkdir -p uploads

# entrypoint 스크립트 권한
RUN chmod +x docker-entrypoint.sh

# 포트 노출
EXPOSE 5000

# 실행
CMD ["./docker-entrypoint.sh"]
