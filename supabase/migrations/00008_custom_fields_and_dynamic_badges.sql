-- Migration: 커스텀 필드 및 동적 뱃지 지원
-- 1) customers 테이블에 custom_fields JSONB 컬럼 추가
-- 2) status, category 컬럼을 VARCHAR로 변경 (동적 값 허용)

-- 1) custom_fields JSONB 컬럼 추가
ALTER TABLE customers ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- 2) status 컬럼을 VARCHAR로 변경
-- 기존 enum 값들은 그대로 유지되며 새로운 값도 저장 가능
ALTER TABLE customers
  ALTER COLUMN status TYPE VARCHAR(50) USING status::VARCHAR;

-- 3) category 컬럼을 VARCHAR로 변경
ALTER TABLE customers
  ALTER COLUMN category TYPE VARCHAR(50) USING category::VARCHAR;

-- 4) 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_customers_custom_fields ON customers USING GIN(custom_fields);

-- 5) 기존 enum 타입은 더 이상 사용하지 않으므로 DROP (선택적)
-- 주의: 다른 테이블에서 사용 중이면 에러 발생할 수 있음
-- DROP TYPE IF EXISTS customer_status;
-- DROP TYPE IF EXISTS customer_category;
