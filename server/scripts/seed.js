const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gugarden',
  });

  console.log('데이터베이스 연결 성공!');

  try {
    // 비밀번호 해시 생성
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // 기존 데이터 삭제 (순서 중요)
    console.log('기존 데이터 삭제 중...');
    await connection.query('DELETE FROM rental_inquiries');
    await connection.query('DELETE FROM order_items');
    await connection.query('DELETE FROM orders');
    await connection.query('DELETE FROM cart_items');
    await connection.query('DELETE FROM product_images');
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM users WHERE email != "admin@gugarden.com"');

    // 관리자 계정
    console.log('관리자 계정 생성 중...');
    await connection.query(
      'INSERT IGNORE INTO users (email, password, name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@gugarden.com', adminPassword, '관리자', '010-1234-5678', '서울시 강남구', 'admin']
    );

    // 일반 사용자
    console.log('일반 사용자 생성 중...');
    await connection.query(
      `INSERT INTO users (email, password, name, phone, address, address_detail, zipcode, role) VALUES
      (?, ?, '김철수', '010-1111-2222', '서울시 서초구 서초대로 123', '101호', '06600', 'user'),
      (?, ?, '이영희', '010-3333-4444', '서울시 강남구 테헤란로 456', '202호', '06234', 'user'),
      (?, ?, '박민수', '010-5555-6666', '경기도 성남시 분당구 판교역로 789', '303호', '13494', 'user')`,
      ['user1@example.com', userPassword, 'user2@example.com', userPassword, 'user3@example.com', userPassword]
    );

    // 테라리움 상품
    console.log('테라리움 상품 등록 중...');
    await connection.query(`
      INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_active, is_featured) VALUES
      (1, '미니 테라리움 - 그린', 'mini-terrarium-green', '작고 귀여운 데스크탑용 미니 테라리움입니다. 관리가 쉽고 공간을 많이 차지하지 않아 사무실이나 집에서 키우기 좋습니다.', 45000, 39000, 15, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500', true, true),
      (1, '클래식 테라리움 - 원형', 'classic-terrarium-round', '둥근 유리 용기에 담긴 클래식한 테라리움. 다양한 식물과 이끼로 구성된 작은 숲을 경험해보세요.', 68000, 58000, 12, 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=500', true, true),
      (1, '프리미엄 테라리움 - 대형', 'premium-terrarium-large', '큰 유리 용기에 다양한 식물과 돌, 이끼로 구성된 프리미엄 테라리움. 인테리어 소품으로 최고의 선택입니다.', 120000, null, 8, 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500', true, true),
      (1, '행잉 테라리움', 'hanging-terrarium', '공중에 매달 수 있는 행잉 테라리움. 독특한 디자인으로 공간을 아름답게 꾸며줍니다.', 52000, 48000, 20, 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=500', true, false),
      (1, '기하학 테라리움', 'geometric-terrarium', '모던한 기하학적 디자인의 테라리움. 현대적인 인테리어에 완벽하게 어울립니다.', 75000, null, 10, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500', true, false),
      (1, '빈티지 테라리움', 'vintage-terrarium', '앤틱한 느낌의 빈티지 스타일 테라리움. 클래식한 분위기를 연출합니다.', 85000, 75000, 6, 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500', true, false)
    `);

    // 비바리움 상품
    console.log('비바리움 상품 등록 중...');
    await connection.query(`
      INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_active, is_featured) VALUES
      (2, '열대우림 비바리움 - 소형', 'tropical-vivarium-small', '작은 도마뱀이나 개구리를 키울 수 있는 열대우림 스타일 비바리움입니다. 습도 조절이 용이합니다.', 180000, 165000, 5, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500', true, true),
      (2, '사막 비바리움 - 중형', 'desert-vivarium-medium', '사막 환경을 재현한 중형 비바리움. 선인장과 다육식물로 구성되어 있습니다.', 220000, null, 4, 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=500', true, false),
      (2, '수륙 양용 비바리움', 'aqua-terrarium', '물과 육지가 공존하는 수륙 양용 비바리움. 거북이나 개구리에게 완벽합니다.', 280000, 250000, 3, 'https://images.unsplash.com/photo-1520967216337-bea9ab285b62?w=500', true, true),
      (2, '정글 비바리움 - 대형', 'jungle-vivarium-large', '대형 크기의 정글 스타일 비바리움. 다양한 파충류를 위한 최적의 환경입니다.', 420000, null, 2, 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500', true, false)
    `);

    // 키트 상품
    console.log('키트 상품 등록 중...');
    await connection.query(`
      INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_active, is_featured) VALUES
      (3, 'DIY 테라리움 키트 - 베이직', 'diy-kit-basic', '초보자를 위한 기본 테라리움 키트. 필요한 모든 재료와 설명서가 포함되어 있습니다.', 35000, 29000, 30, 'https://images.unsplash.com/photo-1591958911259-bee2173bddc8?w=500', true, true),
      (3, 'DIY 테라리움 키트 - 스탠다드', 'diy-kit-standard', '더 다양한 식물과 장식으로 구성된 스탠다드 키트입니다.', 48000, null, 25, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500', true, false),
      (3, 'DIY 테라리움 키트 - 프리미엄', 'diy-kit-premium', '고급 재료와 희귀 식물이 포함된 프리미엄 DIY 키트입니다.', 78000, 68000, 18, 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=500', true, true),
      (3, 'DIY 비바리움 키트', 'diy-vivarium-kit', '작은 파충류를 위한 DIY 비바리움 키트. 초보자도 쉽게 만들 수 있습니다.', 95000, null, 12, 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=500', true, false),
      (3, '키즈 테라리움 키트', 'kids-terrarium-kit', '어린이를 위한 안전하고 쉬운 테라리움 만들기 키트입니다.', 28000, 25000, 40, 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=500', true, false)
    `);

    // 상품 ID 가져오기
    const [products] = await connection.query('SELECT id FROM products ORDER BY id');

    // 상품 추가 이미지
    if (products.length >= 11) {
      console.log('상품 이미지 등록 중...');
      const productIds = products.map(p => p.id);

      const images = [
        [productIds[0], 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 1],
        [productIds[0], 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=800', 2],
        [productIds[1], 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=800', 1],
        [productIds[1], 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800', 2],
        [productIds[2], 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800', 1],
        [productIds[2], 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800', 2],
        [productIds[6], 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800', 1],
        [productIds[6], 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=800', 2],
        [productIds[10], 'https://images.unsplash.com/photo-1591958911259-bee2173bddc8?w=800', 1],
        [productIds[10], 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 2],
      ];

      for (const [pid, url, order] of images) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [pid, url, order]
        );
      }
    }

    // 사용자 ID 가져오기
    const [users] = await connection.query('SELECT id FROM users WHERE role = "user" ORDER BY id');

    if (users.length >= 3 && products.length >= 11) {
      const userIds = users.map(u => u.id);
      const productIds = products.map(p => p.id);

      // 샘플 주문 데이터
      console.log('샘플 주문 생성 중...');
      await connection.query(`
        INSERT INTO orders (user_id, order_number, total_amount, shipping_fee, status, recipient_name, recipient_phone, recipient_address, recipient_address_detail, recipient_zipcode, payment_method, paid_at) VALUES
        (?, 'ORD-20250116-001', 42000, 3000, 'delivered', '김철수', '010-1111-2222', '서울시 서초구 서초대로 123', '101호', '06600', 'card', '2025-01-10 14:30:00'),
        (?, 'ORD-20250116-002', 61000, 3000, 'shipped', '김철수', '010-1111-2222', '서울시 서초구 서초대로 123', '101호', '06600', 'card', '2025-01-14 10:20:00'),
        (?, 'ORD-20250116-003', 165000, 0, 'preparing', '이영희', '010-3333-4444', '서울시 강남구 테헤란로 456', '202호', '06234', 'card', '2025-01-15 16:45:00'),
        (?, 'ORD-20250116-004', 32000, 3000, 'paid', '박민수', '010-5555-6666', '경기도 성남시 분당구 판교역로 789', '303호', '13494', 'card', '2025-01-16 09:15:00')
      `, [userIds[0], userIds[0], userIds[1], userIds[2]]);

      // 주문 ID 가져오기
      const [orders] = await connection.query('SELECT id FROM orders ORDER BY id');
      const orderIds = orders.map(o => o.id);

      // 주문 상품
      console.log('주문 상품 등록 중...');
      await connection.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES
        (?, ?, '미니 테라리움 - 그린', 39000, 1),
        (?, ?, '클래식 테라리움 - 원형', 58000, 1),
        (?, ?, '열대우림 비바리움 - 소형', 165000, 1),
        (?, ?, 'DIY 테라리움 키트 - 베이직', 29000, 1)
      `, [orderIds[0], productIds[0], orderIds[1], productIds[1], orderIds[2], productIds[6], orderIds[3], productIds[10]]);
    }

    // 렌탈 문의
    console.log('렌탈 문의 등록 중...');
    await connection.query(`
      INSERT INTO rental_inquiries (name, email, phone, company, location, space_size, message, status) VALUES
      ('최대표', 'ceo@company.com', '010-9999-8888', '㈜그린오피스', '서울시 강남구 테헤란로 500', '약 100평', '사무실 로비와 회의실에 테라리움 렌탈을 희망합니다.', 'new'),
      ('강실장', 'manager@cafe.com', '010-7777-6666', '카페 포레스트', '서울시 마포구 홍대입구역 근처', '약 50평', '카페 인테리어용 대형 테라리움과 비바리움 렌탈 문의드립니다.', 'contacted'),
      ('정부장', 'director@hotel.com', '010-5555-4444', '그린호텔', '서울시 중구 명동', '로비 약 200평', '호텔 로비 인테리어를 위한 대형 테라리움 렌탈 상담 요청합니다.', 'new')
    `);

    console.log('\n✅ 더미 데이터 생성 완료!');
    console.log('\n계정 정보:');
    console.log('- 관리자: admin@gugarden.com / admin123');
    console.log('- 일반 회원: user1@example.com / user123');
    console.log('- 총 상품: 15개 (테라리움 6개, 비바리움 4개, 키트 5개)');
    console.log('- 총 주문: 4개');
    console.log('- 렌탈 문의: 3개\n');

  } catch (error) {
    console.error('오류 발생:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed()
  .then(() => {
    console.log('시딩 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('시딩 실패:', error);
    process.exit(1);
  });
