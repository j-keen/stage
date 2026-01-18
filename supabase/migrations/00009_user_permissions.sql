-- Add individual permission columns to users table
-- This allows per-user custom permissions separate from role-based permissions

-- Add permissions column for custom per-user permissions
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT NULL;

-- Add permission_mode column to specify how permissions are applied
-- 'role_only': Use role permissions only (default, maintains backward compatibility)
-- 'custom_only': Use custom permissions only, ignore role permissions
ALTER TABLE users ADD COLUMN IF NOT EXISTS permission_mode VARCHAR(20) DEFAULT 'role_only';

-- Add check constraint for valid permission modes
ALTER TABLE users ADD CONSTRAINT users_permission_mode_check
CHECK (permission_mode IN ('role_only', 'custom_only'));

-- Create partial index for users with custom permissions (performance optimization)
CREATE INDEX IF NOT EXISTS idx_users_permission_mode
ON users(permission_mode)
WHERE permission_mode != 'role_only';

-- Add comments for documentation
COMMENT ON COLUMN users.permissions IS 'Custom per-user permissions (JSON). Only used when permission_mode is custom_only.';
COMMENT ON COLUMN users.permission_mode IS 'Permission mode: role_only (use role permissions) or custom_only (use custom permissions)';
