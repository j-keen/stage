-- 사용자 활동 로그 및 메모 기능 추가

-- 1. users 테이블에 메모, 마지막 활동일 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- 2. teams 테이블에 메모 추가
ALTER TABLE teams ADD COLUMN IF NOT EXISTS memo TEXT;

-- 3. 사용자 활동 로그 테이블 생성
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_logs(action);

-- RLS 정책 (관리자만 접근 가능)
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read access to user_activity_logs"
  ON user_activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.auth_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Allow admin insert access to user_activity_logs"
  ON user_activity_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.auth_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- 서비스 롤 접근 허용 (서버 사이드에서 활동 로그 기록용)
CREATE POLICY "Allow service role full access to user_activity_logs"
  ON user_activity_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
