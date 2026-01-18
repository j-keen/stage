-- 고객 샘플 데이터 50건
-- Supabase SQL Editor에서 바로 실행 가능한 간단한 INSERT 문
-- 분포: 오늘(5) + 어제(8) + 이번주(7) + 이번달(15) + 지난달(15) = 50명

-- 실행 전 브랜치가 있어야 함 (seed.sql 먼저 실행)
-- status: 'new', 'contacted', 'consulting', 'pending', 'approved', 'rejected', 'completed', 'cancelled'

-- 오늘 고객 (5명)
INSERT INTO customers (phone, name, status, branch_id, occupation, income, credit_score, existing_loans, created_at, updated_at)
VALUES
  ('01012345001', '김민준', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '회사원', 45000000, 720, 10000000, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('01012345002', '이서연', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '자영업', 60000000, 680, 25000000, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  ('01012345003', '박지후', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '프리랜서', 35000000, 650, 5000000, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  ('01012345004', '최수빈', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '공무원', 52000000, 780, 0, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
  ('01012345005', '정예준', 'contacted', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '회사원', 48000000, 700, 15000000, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours');

-- 어제 고객 (8명)
INSERT INTO customers (phone, name, status, branch_id, occupation, income, credit_score, existing_loans, created_at, updated_at)
VALUES
  ('01012345006', '강지아', 'completed', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '의사', 120000000, 850, 50000000, NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),
  ('01012345007', '조도윤', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '회사원', 42000000, 690, 8000000, NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 3 hours'),
  ('01012345008', '윤하은', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '주부', 0, 600, 3000000, NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours'),
  ('01012345009', '장시우', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '자영업', 75000000, 710, 30000000, NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 5 hours'),
  ('01012345010', '임지유', 'cancelled', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '무직', 0, 450, 80000000, NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 6 hours'),
  ('01012345011', '김준서', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '회사원', 55000000, 730, 12000000, NOW() - INTERVAL '1 day 7 hours', NOW() - INTERVAL '1 day 7 hours'),
  ('01012345012', '이윤아', 'contacted', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '교사', 50000000, 760, 5000000, NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day 8 hours'),
  ('01012345013', '박현우', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '엔지니어', 65000000, 740, 20000000, NOW() - INTERVAL '1 day 9 hours', NOW() - INTERVAL '1 day 9 hours');

-- 이번 주 고객 (7명) - 2~6일 전
INSERT INTO customers (phone, name, status, branch_id, occupation, income, credit_score, existing_loans, created_at, updated_at)
VALUES
  ('01012345014', '최지민', 'approved', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '변호사', 100000000, 820, 40000000, NOW() - INTERVAL '2 days 5 hours', NOW() - INTERVAL '2 days 5 hours'),
  ('01012345015', '정민서', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '간호사', 45000000, 700, 7000000, NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 2 hours'),
  ('01012345016', '강서준', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '회사원', 48000000, 680, 15000000, NOW() - INTERVAL '3 days 8 hours', NOW() - INTERVAL '3 days 8 hours'),
  ('01012345017', '조예은', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '사업가', 200000000, 800, 100000000, NOW() - INTERVAL '4 days 3 hours', NOW() - INTERVAL '4 days 3 hours'),
  ('01012345018', '윤도현', 'contacted', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '배달기사', 30000000, 580, 20000000, NOW() - INTERVAL '5 days 6 hours', NOW() - INTERVAL '5 days 6 hours'),
  ('01012345019', '장수아', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '디자이너', 55000000, 720, 10000000, NOW() - INTERVAL '5 days 10 hours', NOW() - INTERVAL '5 days 10 hours'),
  ('01012345020', '임준혁', 'completed', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '약사', 70000000, 770, 25000000, NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 4 hours');

-- 이번 달 고객 (15명) - 7~25일 전
INSERT INTO customers (phone, name, status, branch_id, occupation, income, credit_score, existing_loans, created_at, updated_at)
VALUES
  ('01012345021', '김태연', 'approved', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), 'CEO', 300000000, 880, 200000000, NOW() - INTERVAL '8 days 3 hours', NOW() - INTERVAL '8 days 3 hours'),
  ('01012345022', '이승민', 'rejected', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '학생', 0, 0, 0, NOW() - INTERVAL '9 days 5 hours', NOW() - INTERVAL '9 days 5 hours'),
  ('01012345023', '박하린', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '회계사', 80000000, 790, 35000000, NOW() - INTERVAL '10 days 2 hours', NOW() - INTERVAL '10 days 2 hours'),
  ('01012345024', '최유진', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '영업사원', 40000000, 660, 12000000, NOW() - INTERVAL '11 days 7 hours', NOW() - INTERVAL '11 days 7 hours'),
  ('01012345025', '정다인', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '마케터', 52000000, 710, 8000000, NOW() - INTERVAL '12 days 4 hours', NOW() - INTERVAL '12 days 4 hours'),
  ('01012345026', '강민재', 'contacted', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '운전기사', 35000000, 620, 18000000, NOW() - INTERVAL '13 days 6 hours', NOW() - INTERVAL '13 days 6 hours'),
  ('01012345027', '조서윤', 'completed', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '연구원', 60000000, 750, 15000000, NOW() - INTERVAL '14 days 8 hours', NOW() - INTERVAL '14 days 8 hours'),
  ('01012345028', '윤재원', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '건축가', 75000000, 730, 30000000, NOW() - INTERVAL '15 days 3 hours', NOW() - INTERVAL '15 days 3 hours'),
  ('01012345029', '장소희', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '바리스타', 28000000, 600, 5000000, NOW() - INTERVAL '17 days 5 hours', NOW() - INTERVAL '17 days 5 hours'),
  ('01012345030', '임지훈', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '투자자', 150000000, 840, 80000000, NOW() - INTERVAL '18 days 2 hours', NOW() - INTERVAL '18 days 2 hours'),
  ('01012345031', '김예린', 'cancelled', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '무직', 0, 400, 120000000, NOW() - INTERVAL '19 days 9 hours', NOW() - INTERVAL '19 days 9 hours'),
  ('01012345032', '이동현', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '개발자', 70000000, 760, 20000000, NOW() - INTERVAL '20 days 4 hours', NOW() - INTERVAL '20 days 4 hours'),
  ('01012345033', '박서영', 'approved', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), 'PD', 65000000, 740, 25000000, NOW() - INTERVAL '22 days 6 hours', NOW() - INTERVAL '22 days 6 hours'),
  ('01012345034', '최현지', 'contacted', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '승무원', 55000000, 700, 10000000, NOW() - INTERVAL '24 days 3 hours', NOW() - INTERVAL '24 days 3 hours'),
  ('01012345035', '정우진', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '요리사', 38000000, 650, 8000000, NOW() - INTERVAL '25 days 7 hours', NOW() - INTERVAL '25 days 7 hours');

-- 지난 달 고객 (15명) - 31~55일 전
INSERT INTO customers (phone, name, status, branch_id, occupation, income, credit_score, existing_loans, created_at, updated_at)
VALUES
  ('01012345036', '강수진', 'completed', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '치과의사', 130000000, 860, 60000000, NOW() - INTERVAL '32 days 4 hours', NOW() - INTERVAL '32 days 4 hours'),
  ('01012345037', '조민수', 'rejected', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '대학생', 12000000, 550, 2000000, NOW() - INTERVAL '34 days 6 hours', NOW() - INTERVAL '34 days 6 hours'),
  ('01012345038', '윤하준', 'approved', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '세무사', 90000000, 800, 45000000, NOW() - INTERVAL '35 days 2 hours', NOW() - INTERVAL '35 days 2 hours'),
  ('01012345039', '장예나', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '간호조무사', 32000000, 640, 10000000, NOW() - INTERVAL '37 days 8 hours', NOW() - INTERVAL '37 days 8 hours'),
  ('01012345040', '임서현', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '물류관리자', 48000000, 690, 18000000, NOW() - INTERVAL '38 days 5 hours', NOW() - INTERVAL '38 days 5 hours'),
  ('01012345041', '김도연', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '미용사', 30000000, 610, 7000000, NOW() - INTERVAL '40 days 3 hours', NOW() - INTERVAL '40 days 3 hours'),
  ('01012345042', '이준호', 'completed', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '변리사', 110000000, 830, 55000000, NOW() - INTERVAL '42 days 7 hours', NOW() - INTERVAL '42 days 7 hours'),
  ('01012345043', '박지은', 'contacted', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '사회복지사', 35000000, 670, 12000000, NOW() - INTERVAL '44 days 4 hours', NOW() - INTERVAL '44 days 4 hours'),
  ('01012345044', '최성민', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '항공정비사', 58000000, 720, 22000000, NOW() - INTERVAL '46 days 6 hours', NOW() - INTERVAL '46 days 6 hours'),
  ('01012345045', '정유나', 'cancelled', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '무직', 0, 380, 150000000, NOW() - INTERVAL '48 days 2 hours', NOW() - INTERVAL '48 days 2 hours'),
  ('01012345046', '강태희', 'approved', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '경찰관', 52000000, 750, 15000000, NOW() - INTERVAL '50 days 8 hours', NOW() - INTERVAL '50 days 8 hours'),
  ('01012345047', '조현준', 'pending', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '소방관', 50000000, 740, 13000000, NOW() - INTERVAL '51 days 5 hours', NOW() - INTERVAL '51 days 5 hours'),
  ('01012345048', '윤미래', 'new', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '작가', 25000000, 620, 6000000, NOW() - INTERVAL '52 days 3 hours', NOW() - INTERVAL '52 days 3 hours'),
  ('01012345049', '장승우', 'consulting', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '군인', 45000000, 700, 8000000, NOW() - INTERVAL '54 days 7 hours', NOW() - INTERVAL '54 days 7 hours'),
  ('01012345050', '임하늘', 'completed', (SELECT id FROM branches WHERE slug = 'default' LIMIT 1), '한의사', 95000000, 810, 40000000, NOW() - INTERVAL '55 days 4 hours', NOW() - INTERVAL '55 days 4 hours');

-- 검증 쿼리
SELECT '=== 전체 고객 수 ===' as info;
SELECT COUNT(*) as total_customers FROM customers;

SELECT '=== 기간별 분포 ===' as info;
SELECT
  CASE
    WHEN created_at >= NOW() - INTERVAL '1 day' THEN '오늘'
    WHEN created_at >= NOW() - INTERVAL '2 days' THEN '어제'
    WHEN created_at >= NOW() - INTERVAL '7 days' THEN '이번 주'
    WHEN created_at >= NOW() - INTERVAL '30 days' THEN '이번 달'
    ELSE '지난 달'
  END as period,
  COUNT(*) as count
FROM customers
GROUP BY 1
ORDER BY
  CASE
    WHEN period = '오늘' THEN 1
    WHEN period = '어제' THEN 2
    WHEN period = '이번 주' THEN 3
    WHEN period = '이번 달' THEN 4
    ELSE 5
  END;

SELECT '=== 상태별 분포 ===' as info;
SELECT status, COUNT(*) as count
FROM customers
GROUP BY status
ORDER BY count DESC;
