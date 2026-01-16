-- 구의정원 더미 데이터
-- 테스트용 샘플 데이터

USE gugarden;

-- 관리자 계정 (비밀번호: admin123)
INSERT INTO users (email, password, name, phone, address, role) VALUES
('admin@gugarden.com', '$2b$10$YourHashedPasswordHere', '관리자', '010-1234-5678', '서울시 강남구', 'admin');

-- 일반 사용자 (비밀번호: user123)
INSERT INTO users (email, password, name, phone, address, address_detail, zipcode, role) VALUES
('user1@example.com', '$2b$10$YourHashedPasswordHere', '김철수', '010-1111-2222', '서울시 서초구 서초대로 123', '101호', '06600', 'user'),
('user2@example.com', '$2b$10$YourHashedPasswordHere', '이영희', '010-3333-4444', '서울시 강남구 테헤란로 456', '202호', '06234', 'user'),
('user3@example.com', '$2b$10$YourHashedPasswordHere', '박민수', '010-5555-6666', '경기도 성남시 분당구 판교역로 789', '303호', '13494', 'user');

-- 테라리움 상품
INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_active, is_featured) VALUES
(1, '미니 테라리움 - 그린', 'mini-terrarium-green', '작고 귀여운 데스크탑용 미니 테라리움입니다. 관리가 쉽고 공간을 많이 차지하지 않아 사무실이나 집에서 키우기 좋습니다.', 45000, 39000, 15, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500', true, true),
(1, '클래식 테라리움 - 원형', 'classic-terrarium-round', '둥근 유리 용기에 담긴 클래식한 테라리움. 다양한 식물과 이끼로 구성된 작은 숲을 경험해보세요.', 68000, 58000, 12, 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=500', true, true),
(1, '프리미엄 테라리움 - 대형', 'premium-terrarium-large', '큰 유리 용기에 다양한 식물과 돌, 이끼로 구성된 프리미엄 테라리움. 인테리어 소품으로 최고의 선택입니다.', 120000, null, 8, 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500', true, true),
(1, '행잉 테라리움', 'hanging-terrarium', '공중에 매달 수 있는 행잉 테라리움. 독특한 디자인으로 공간을 아름답게 꾸며줍니다.', 52000, 48000, 20, 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=500', true, false),
(1, '기하학 테라리움', 'geometric-terrarium', '모던한 기하학적 디자인의 테라리움. 현대적인 인테리어에 완벽하게 어울립니다.', 75000, null, 10, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500', true, false),
(1, '빈티지 테라리움', 'vintage-terrarium', '앤틱한 느낌의 빈티지 스타일 테라리움. 클래식한 분위기를 연출합니다.', 85000, 75000, 6, 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500', true, false);

-- 비바리움 상품
INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_active, is_featured) VALUES
(2, '열대우림 비바리움 - 소형', 'tropical-vivarium-small', '작은 도마뱀이나 개구리를 키울 수 있는 열대우림 스타일 비바리움입니다. 습도 조절이 용이합니다.', 180000, 165000, 5, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500', true, true),
(2, '사막 비바리움 - 중형', 'desert-vivarium-medium', '사막 환경을 재현한 중형 비바리움. 선인장과 다육식물로 구성되어 있습니다.', 220000, null, 4, 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=500', true, false),
(2, '수륙 양용 비바리움', 'aqua-terrarium', '물과 육지가 공존하는 수륙 양용 비바리움. 거북이나 개구리에게 완벽합니다.', 280000, 250000, 3, 'https://images.unsplash.com/photo-1520967216337-bea9ab285b62?w=500', true, true),
(2, '정글 비바리움 - 대형', 'jungle-vivarium-large', '대형 크기의 정글 스타일 비바리움. 다양한 파충류를 위한 최적의 환경입니다.', 420000, null, 2, 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500', true, false);

-- 키트 상품
INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, thumbnail, is_active, is_featured) VALUES
(3, 'DIY 테라리움 키트 - 베이직', 'diy-kit-basic', '초보자를 위한 기본 테라리움 키트. 필요한 모든 재료와 설명서가 포함되어 있습니다.', 35000, 29000, 30, 'https://images.unsplash.com/photo-1591958911259-bee2173bddc8?w=500', true, true),
(3, 'DIY 테라리움 키트 - 스탠다드', 'diy-kit-standard', '더 다양한 식물과 장식으로 구성된 스탠다드 키트입니다.', 48000, null, 25, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500', true, false),
(3, 'DIY 테라리움 키트 - 프리미엄', 'diy-kit-premium', '고급 재료와 희귀 식물이 포함된 프리미엄 DIY 키트입니다.', 78000, 68000, 18, 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=500', true, true),
(3, 'DIY 비바리움 키트', 'diy-vivarium-kit', '작은 파충류를 위한 DIY 비바리움 키트. 초보자도 쉽게 만들 수 있습니다.', 95000, null, 12, 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=500', true, false),
(3, '키즈 테라리움 키트', 'kids-terrarium-kit', '어린이를 위한 안전하고 쉬운 테라리움 만들기 키트입니다.', 28000, 25000, 40, 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=500', true, false);

-- 상품 추가 이미지
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 1),
(1, 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=800', 2),
(2, 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=800', 1),
(2, 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800', 2),
(3, 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800', 1),
(3, 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800', 2),
(7, 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800', 1),
(7, 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=800', 2),
(11, 'https://images.unsplash.com/photo-1591958911259-bee2173bddc8?w=800', 1),
(11, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 2);

-- 샘플 주문 데이터
INSERT INTO orders (user_id, order_number, total_amount, shipping_fee, status, recipient_name, recipient_phone, recipient_address, recipient_address_detail, recipient_zipcode, payment_method, paid_at) VALUES
(2, 'ORD-20250116-001', 42000, 3000, 'delivered', '김철수', '010-1111-2222', '서울시 서초구 서초대로 123', '101호', '06600', 'card', '2025-01-10 14:30:00'),
(2, 'ORD-20250116-002', 61000, 3000, 'shipped', '김철수', '010-1111-2222', '서울시 서초구 서초대로 123', '101호', '06600', 'card', '2025-01-14 10:20:00'),
(3, 'ORD-20250116-003', 165000, 0, 'preparing', '이영희', '010-3333-4444', '서울시 강남구 테헤란로 456', '202호', '06234', 'card', '2025-01-15 16:45:00'),
(4, 'ORD-20250116-004', 32000, 3000, 'paid', '박민수', '010-5555-6666', '경기도 성남시 분당구 판교역로 789', '303호', '13494', 'card', '2025-01-16 09:15:00');

-- 주문 상품
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES
(1, 1, '미니 테라리움 - 그린', 39000, 1),
(2, 2, '클래식 테라리움 - 원형', 58000, 1),
(3, 7, '열대우림 비바리움 - 소형', 165000, 1),
(4, 11, 'DIY 테라리움 키트 - 베이직', 29000, 1);

-- 렌탈 문의
INSERT INTO rental_inquiries (name, email, phone, company, location, space_size, message, status) VALUES
('최대표', 'ceo@company.com', '010-9999-8888', '㈜그린오피스', '서울시 강남구 테헤란로 500', '약 100평', '사무실 로비와 회의실에 테라리움 렌탈을 희망합니다.', 'new'),
('강실장', 'manager@cafe.com', '010-7777-6666', '카페 포레스트', '서울시 마포구 홍대입구역 근처', '약 50평', '카페 인테리어용 대형 테라리움과 비바리움 렌탈 문의드립니다.', 'contacted'),
('정부장', 'director@hotel.com', '010-5555-4444', '그린호텔', '서울시 중구 명동', '로비 약 200평', '호텔 로비 인테리어를 위한 대형 테라리움 렌탈 상담 요청합니다.', 'new');
