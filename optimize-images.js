const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = './client/public/images';
const backupDir = './client/public/images/originals';

// 백업 디렉토리 생성
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// JPEG 파일 목록 가져오기
const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => file.endsWith('.jpeg') || file.endsWith('.jpg'));

console.log(`총 ${imageFiles.length}개의 이미지를 최적화합니다...\n`);

// 각 이미지 최적화
async function optimizeImages() {
  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const backupPath = path.join(backupDir, file);
    const outputPath = path.join(imagesDir, file);

    try {
      // 원본 파일 크기
      const originalStats = fs.statSync(inputPath);
      const originalSize = (originalStats.size / 1024 / 1024).toFixed(2);

      // 백업
      fs.copyFileSync(inputPath, backupPath);

      // 최적화
      await sharp(inputPath)
        .jpeg({
          quality: 80,
          progressive: true,
          mozjpeg: true
        })
        .toFile(outputPath + '.tmp');

      // 임시 파일을 원본으로 교체
      fs.renameSync(outputPath + '.tmp', outputPath);

      // 최적화된 파일 크기
      const optimizedStats = fs.statSync(outputPath);
      const optimizedSize = (optimizedStats.size / 1024 / 1024).toFixed(2);
      const reduction = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);

      console.log(`✓ ${file}`);
      console.log(`  ${originalSize}MB → ${optimizedSize}MB (${reduction}% 감소)\n`);
    } catch (error) {
      console.error(`✗ ${file} 최적화 실패:`, error.message);
    }
  }

  console.log('최적화 완료! 원본 파일은 client/public/images/originals 폴더에 백업되었습니다.');
}

optimizeImages().catch(console.error);
