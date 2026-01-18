-- Database Functions
-- 데이터베이스 함수 정의

-- Check duplicate phone number
CREATE OR REPLACE FUNCTION check_duplicate_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers
    WHERE phone = phone_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team hierarchy (recursive)
CREATE OR REPLACE FUNCTION get_team_hierarchy(team_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  parent_id UUID,
  level INT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE team_tree AS (
    SELECT t.id, t.name, t.parent_id, 0 AS level
    FROM teams t
    WHERE t.id = team_id

    UNION ALL

    SELECT t.id, t.name, t.parent_id, tt.level + 1
    FROM teams t
    JOIN team_tree tt ON t.parent_id = tt.id
  )
  SELECT * FROM team_tree;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get customer statistics by status
CREATE OR REPLACE FUNCTION get_customer_stats_by_status(
  from_date TIMESTAMPTZ DEFAULT NULL,
  to_date TIMESTAMPTZ DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  status customer_status,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.status, COUNT(*) as count
  FROM customers c
  WHERE (from_date IS NULL OR c.created_at >= from_date)
    AND (to_date IS NULL OR c.created_at <= to_date)
    AND (p_branch_id IS NULL OR c.branch_id = p_branch_id)
  GROUP BY c.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get customer statistics by assigned user
CREATE OR REPLACE FUNCTION get_customer_stats_by_user(
  from_date TIMESTAMPTZ DEFAULT NULL,
  to_date TIMESTAMPTZ DEFAULT NULL,
  p_team_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name VARCHAR(100),
  total_count BIGINT,
  new_count BIGINT,
  completed_count BIGINT,
  approved_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as user_id,
    u.name as user_name,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE c.status = 'new') as new_count,
    COUNT(*) FILTER (WHERE c.status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE c.status = 'approved') as approved_count
  FROM users u
  LEFT JOIN customers c ON c.assigned_to = u.id
    AND (from_date IS NULL OR c.created_at >= from_date)
    AND (to_date IS NULL OR c.created_at <= to_date)
  WHERE (p_team_id IS NULL OR u.team_id = p_team_id)
    AND u.is_active = TRUE
  GROUP BY u.id, u.name
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-assign customer to user (round-robin within team)
CREATE OR REPLACE FUNCTION auto_assign_customer(
  p_customer_id UUID,
  p_team_id UUID
)
RETURNS UUID AS $$
DECLARE
  assigned_user_id UUID;
BEGIN
  -- Find the user with fewest assignments in the team
  SELECT u.id INTO assigned_user_id
  FROM users u
  LEFT JOIN (
    SELECT assigned_to, COUNT(*) as cnt
    FROM customers
    WHERE status IN ('new', 'contacted', 'consulting')
    GROUP BY assigned_to
  ) c ON c.assigned_to = u.id
  WHERE u.team_id = p_team_id
    AND u.is_active = TRUE
  ORDER BY COALESCE(c.cnt, 0) ASC, RANDOM()
  LIMIT 1;

  IF assigned_user_id IS NOT NULL THEN
    UPDATE customers
    SET assigned_to = assigned_user_id
    WHERE id = p_customer_id;
  END IF;

  RETURN assigned_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get daily customer count for dashboard
CREATE OR REPLACE FUNCTION get_daily_customer_count(
  p_days INT DEFAULT 30,
  p_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count
  FROM customers
  WHERE created_at >= CURRENT_DATE - p_days
    AND (p_branch_id IS NULL OR branch_id = p_branch_id)
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search customers with full text
CREATE OR REPLACE FUNCTION search_customers(
  search_query TEXT,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  phone VARCHAR(20),
  name VARCHAR(100),
  status customer_status,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.phone,
    c.name,
    c.status,
    c.created_at,
    ts_rank(
      to_tsvector('simple', COALESCE(c.name, '') || ' ' || COALESCE(c.phone, '') || ' ' || COALESCE(c.notes, '')),
      plainto_tsquery('simple', search_query)
    ) as rank
  FROM customers c
  WHERE to_tsvector('simple', COALESCE(c.name, '') || ' ' || COALESCE(c.phone, '') || ' ' || COALESCE(c.notes, ''))
    @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
