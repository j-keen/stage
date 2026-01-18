-- CRM Schema Update: Category, Checkbox Fields, and Status Redefinition
-- 고객 분류 및 상태 체계 재정의

-- 1. Create customer_category enum
CREATE TYPE customer_category AS ENUM (
  'new_customer',  -- 신규고객
  'existing',      -- 기존고객
  'blacklist',     -- 사고자(블랙)
  'vip'            -- VIP
);

-- 2. Add new columns to customers table
ALTER TABLE customers
  ADD COLUMN category customer_category DEFAULT 'new_customer',
  ADD COLUMN has_overdue BOOLEAN DEFAULT FALSE,
  ADD COLUMN has_license BOOLEAN DEFAULT FALSE,
  ADD COLUMN has_insurance BOOLEAN DEFAULT FALSE,
  ADD COLUMN has_credit_card BOOLEAN DEFAULT FALSE,
  ADD COLUMN employment_period VARCHAR(50),
  ADD COLUMN required_amount BIGINT,
  ADD COLUMN fund_purpose TEXT;

-- 3. Create new customer_status_v2 enum (6 statuses per specification)
CREATE TYPE customer_status_v2 AS ENUM (
  'prospect',      -- 가망고객
  'in_progress',   -- 진행중
  'completed',     -- 완료
  'callback',      -- 재통화
  'absent',        -- 부재
  'cancelled'      -- 취소
);

-- 4. Add new status column
ALTER TABLE customers ADD COLUMN status_v2 customer_status_v2;

-- 5. Migrate existing data to new status
UPDATE customers SET status_v2 = CASE
  WHEN status IN ('new', 'contacted') THEN 'prospect'::customer_status_v2
  WHEN status IN ('consulting', 'pending') THEN 'in_progress'::customer_status_v2
  WHEN status IN ('approved', 'completed') THEN 'completed'::customer_status_v2
  WHEN status = 'rejected' THEN 'cancelled'::customer_status_v2
  WHEN status = 'cancelled' THEN 'cancelled'::customer_status_v2
  ELSE 'prospect'::customer_status_v2
END;

-- 6. Set default for new status column
ALTER TABLE customers ALTER COLUMN status_v2 SET DEFAULT 'prospect';
ALTER TABLE customers ALTER COLUMN status_v2 SET NOT NULL;

-- 7. Drop old status column and rename new one
ALTER TABLE customers DROP COLUMN status;
ALTER TABLE customers RENAME COLUMN status_v2 TO status;

-- 8. Drop old enum type
DROP TYPE customer_status;

-- 9. Rename new enum to original name
ALTER TYPE customer_status_v2 RENAME TO customer_status;

-- 10. Add indexes for new filterable columns
CREATE INDEX idx_customers_category ON customers(category);
CREATE INDEX idx_customers_has_license ON customers(has_license);
CREATE INDEX idx_customers_has_insurance ON customers(has_insurance);
CREATE INDEX idx_customers_has_credit_card ON customers(has_credit_card);

-- 11. Add comments for new columns
COMMENT ON COLUMN customers.category IS '고객 분류 (신규/기존/블랙/VIP)';
COMMENT ON COLUMN customers.has_overdue IS '연체유무';
COMMENT ON COLUMN customers.has_license IS '면허증유무';
COMMENT ON COLUMN customers.has_insurance IS '4대보험유무';
COMMENT ON COLUMN customers.has_credit_card IS '신용카드유무';
COMMENT ON COLUMN customers.employment_period IS '재직기간';
COMMENT ON COLUMN customers.required_amount IS '필요자금 (단위: 만원)';
COMMENT ON COLUMN customers.fund_purpose IS '자금용도';
