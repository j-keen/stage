-- Seed Data for CRM System

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', '최고 관리자 - 모든 권한', '{
  "customers": {"view": true, "create": true, "edit": true, "delete": true, "assign": true, "export": true},
  "teams": {"view": true, "create": true, "edit": true, "delete": true},
  "users": {"view": true, "create": true, "edit": true, "delete": true},
  "settings": {"view": true, "edit": true},
  "dashboard": {"view": true, "viewAll": true},
  "branches": {"view": true, "create": true, "edit": true, "delete": true}
}'::JSONB),
('manager', '관리자 - 팀 관리 및 통계', '{
  "customers": {"view": true, "create": true, "edit": true, "delete": false, "assign": true, "export": true},
  "teams": {"view": true, "create": false, "edit": false, "delete": false},
  "users": {"view": true, "create": false, "edit": false, "delete": false},
  "settings": {"view": true, "edit": false},
  "dashboard": {"view": true, "viewAll": true},
  "branches": {"view": true, "create": false, "edit": false, "delete": false}
}'::JSONB),
('consultant', '상담사 - 고객 상담', '{
  "customers": {"view": true, "create": true, "edit": true, "delete": false, "assign": false, "export": false},
  "teams": {"view": true, "create": false, "edit": false, "delete": false},
  "users": {"view": true, "create": false, "edit": false, "delete": false},
  "settings": {"view": false, "edit": false},
  "dashboard": {"view": true, "viewAll": false},
  "branches": {"view": true, "create": false, "edit": false, "delete": false}
}'::JSONB),
('agent', '에이전트 - 접수만 가능', '{
  "customers": {"view": false, "create": true, "edit": false, "delete": false, "assign": false, "export": false},
  "teams": {"view": false, "create": false, "edit": false, "delete": false},
  "users": {"view": false, "create": false, "edit": false, "delete": false},
  "settings": {"view": false, "edit": false},
  "dashboard": {"view": false, "viewAll": false},
  "branches": {"view": true, "create": false, "edit": false, "delete": false}
}'::JSONB);

-- Insert default team
INSERT INTO teams (name, description) VALUES
('본사', '본사 팀');

-- Insert default branch for landing pages
INSERT INTO branches (name, slug, description, primary_color, is_active) VALUES
('기본 접수처', 'default', '기본 랜딩 페이지 접수처', '#3B82F6', true),
('테스트 접수처', 'test', '테스트용 접수처', '#10B981', true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('branding', '{"companyName": "CRM 시스템", "logoUrl": null, "primaryColor": "#3B82F6"}'::JSONB),
('columnLabels', '{"phone": "전화번호", "name": "이름", "status": "상태", "assigned_to": "담당자", "created_at": "등록일"}'::JSONB),
('statusColors', '{"new": "#3B82F6", "contacted": "#8B5CF6", "consulting": "#F59E0B", "pending": "#6B7280", "approved": "#10B981", "rejected": "#EF4444", "completed": "#059669", "cancelled": "#9CA3AF"}'::JSONB);
