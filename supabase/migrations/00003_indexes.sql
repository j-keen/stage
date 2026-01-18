-- Performance Indexes
-- 주요 조회 쿼리 최적화를 위한 인덱스

-- Customers table indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX idx_customers_updated_at ON customers(updated_at DESC);
CREATE INDEX idx_customers_callback_date ON customers(callback_date) WHERE callback_date IS NOT NULL;
CREATE INDEX idx_customers_is_duplicate ON customers(is_duplicate) WHERE is_duplicate = TRUE;

-- Composite indexes for common queries
CREATE INDEX idx_customers_status_assigned ON customers(status, assigned_to);
CREATE INDEX idx_customers_branch_status ON customers(branch_id, status);
CREATE INDEX idx_customers_created_date ON customers(DATE(created_at));

-- Customer histories indexes
CREATE INDEX idx_customer_histories_customer_id ON customer_histories(customer_id);
CREATE INDEX idx_customer_histories_created_at ON customer_histories(created_at DESC);
CREATE INDEX idx_customer_histories_user_id ON customer_histories(user_id) WHERE user_id IS NOT NULL;

-- Users table indexes
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;

-- Teams table indexes
CREATE INDEX idx_teams_parent_id ON teams(parent_id);

-- Branches table indexes
CREATE INDEX idx_branches_slug ON branches(slug);
CREATE INDEX idx_branches_is_active ON branches(is_active) WHERE is_active = TRUE;

-- Settings table indexes
CREATE INDEX idx_settings_key ON settings(key);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(user_id, preference_key);

-- Full text search index for customers
CREATE INDEX idx_customers_search ON customers USING gin(
  to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(phone, '') || ' ' || COALESCE(notes, ''))
);
