#!/bin/bash

# 구의정원 배포 스크립트
# 사용법: ./scripts/deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
DEPLOY_PATH="/var/www/gugarden"

if [ "$ENVIRONMENT" = "staging" ]; then
    DEPLOY_PATH="/var/www/gugarden-staging"
    COMPOSE_FILE="docker-compose.staging.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

echo "=========================================="
echo "  구의정원 배포 시작 ($ENVIRONMENT)"
echo "=========================================="

# 디렉토리 이동
cd $DEPLOY_PATH

# 최신 코드 가져오기
echo ">>> Git pull..."
git pull origin $(git branch --show-current)

# Docker 컨테이너 중지
echo ">>> Stopping containers..."
docker compose -f $COMPOSE_FILE down

# Docker 이미지 빌드
echo ">>> Building images..."
docker compose -f $COMPOSE_FILE build --no-cache

# Docker 컨테이너 시작
echo ">>> Starting containers..."
docker compose -f $COMPOSE_FILE up -d

# 불필요한 이미지 정리
echo ">>> Cleaning up..."
docker image prune -f

# 헬스 체크
echo ">>> Health check..."
sleep 5
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "=========================================="
echo "  배포 완료!"
echo "=========================================="
