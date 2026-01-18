-- CRM Initial Schema
-- 고객상담 CRM 시스템 데이터베이스 스키마

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customer status enum
CREATE TYPE customer_status AS ENUM (
  'new',
  'contacted',
  'consulting',
  'pending',
  'approved',
  'rejected',
  'completed',
  'cancelled'
);

-- Teams table (hierarchical structure)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table with JSON permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table (landing page sources)
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (main customer data)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(10),
  address TEXT,
  address_detail TEXT,
  occupation VARCHAR(100),
  income BIGINT,
  loan_amount BIGINT,
  loan_purpose VARCHAR(200),
  existing_loans BIGINT,
  credit_score INT,
  status customer_status DEFAULT 'new',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES branches(id),
  notes TEXT,
  callback_date TIMESTAMPTZ,
  is_duplicate BOOLEAN DEFAULT FALSE,
  source VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer history table (change tracking)
CREATE TABLE customer_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Comments for documentation
COMMENT ON TABLE teams IS '팀/조직 테이블 (계층구조 지원)';
COMMENT ON TABLE roles IS '역할 및 권한 테이블';
COMMENT ON TABLE users IS '사용자 계정 테이블';
COMMENT ON TABLE branches IS '접수처 테이블 (랜딩 URL용)';
COMMENT ON TABLE customers IS '고객 정보 테이블';
COMMENT ON TABLE customer_histories IS '고객 정보 변경 이력 테이블';
COMMENT ON TABLE settings IS '시스템 설정 테이블';
COMMENT ON TABLE user_preferences IS '사용자별 설정 테이블';
