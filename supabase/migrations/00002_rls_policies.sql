-- Row Level Security Policies
-- 권한 기반 데이터 접근 제어

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role permissions
CREATE OR REPLACE FUNCTION get_user_permissions()
RETURNS JSONB AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  SELECT r.permissions INTO user_permissions
  FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.auth_id = auth.uid();

  RETURN COALESCE(user_permissions, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  perms JSONB;
BEGIN
  perms := get_user_permissions();
  RETURN COALESCE((perms->resource->>action)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.auth_id = auth.uid()
    AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's team_id
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT team_id FROM users WHERE auth_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Teams policies
CREATE POLICY "teams_select" ON teams FOR SELECT USING (
  has_permission('teams', 'view') OR is_super_admin()
);

CREATE POLICY "teams_insert" ON teams FOR INSERT WITH CHECK (
  has_permission('teams', 'create') OR is_super_admin()
);

CREATE POLICY "teams_update" ON teams FOR UPDATE USING (
  has_permission('teams', 'edit') OR is_super_admin()
);

CREATE POLICY "teams_delete" ON teams FOR DELETE USING (
  has_permission('teams', 'delete') OR is_super_admin()
);

-- Roles policies
CREATE POLICY "roles_select" ON roles FOR SELECT USING (TRUE);

CREATE POLICY "roles_all" ON roles FOR ALL USING (is_super_admin());

-- Users policies
CREATE POLICY "users_select" ON users FOR SELECT USING (
  has_permission('users', 'view') OR is_super_admin() OR auth_id = auth.uid()
);

CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (
  has_permission('users', 'create') OR is_super_admin()
);

CREATE POLICY "users_update" ON users FOR UPDATE USING (
  has_permission('users', 'edit') OR is_super_admin() OR auth_id = auth.uid()
);

CREATE POLICY "users_delete" ON users FOR DELETE USING (
  has_permission('users', 'delete') OR is_super_admin()
);

-- Branches policies
CREATE POLICY "branches_select" ON branches FOR SELECT USING (TRUE);

CREATE POLICY "branches_insert" ON branches FOR INSERT WITH CHECK (
  has_permission('branches', 'create') OR is_super_admin()
);

CREATE POLICY "branches_update" ON branches FOR UPDATE USING (
  has_permission('branches', 'edit') OR is_super_admin()
);

CREATE POLICY "branches_delete" ON branches FOR DELETE USING (
  has_permission('branches', 'delete') OR is_super_admin()
);

-- Customers policies
CREATE POLICY "customers_select" ON customers FOR SELECT USING (
  has_permission('customers', 'view') OR is_super_admin() OR
  (assigned_to = (SELECT id FROM users WHERE auth_id = auth.uid()))
);

CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (
  has_permission('customers', 'create') OR is_super_admin() OR TRUE -- Landing pages can create
);

CREATE POLICY "customers_update" ON customers FOR UPDATE USING (
  has_permission('customers', 'edit') OR is_super_admin() OR
  (assigned_to = (SELECT id FROM users WHERE auth_id = auth.uid()))
);

CREATE POLICY "customers_delete" ON customers FOR DELETE USING (
  has_permission('customers', 'delete') OR is_super_admin()
);

-- Customer histories policies
CREATE POLICY "customer_histories_select" ON customer_histories FOR SELECT USING (
  has_permission('customers', 'view') OR is_super_admin()
);

CREATE POLICY "customer_histories_insert" ON customer_histories FOR INSERT WITH CHECK (TRUE);

-- Settings policies
CREATE POLICY "settings_select" ON settings FOR SELECT USING (
  has_permission('settings', 'view') OR is_super_admin()
);

CREATE POLICY "settings_all" ON settings FOR ALL USING (
  has_permission('settings', 'edit') OR is_super_admin()
);

-- User preferences policies
CREATE POLICY "user_preferences_select" ON user_preferences FOR SELECT USING (
  user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

CREATE POLICY "user_preferences_insert" ON user_preferences FOR INSERT WITH CHECK (
  user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

CREATE POLICY "user_preferences_update" ON user_preferences FOR UPDATE USING (
  user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

CREATE POLICY "user_preferences_delete" ON user_preferences FOR DELETE USING (
  user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);
