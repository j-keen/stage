-- Sample Customer Data for Dashboard Testing
-- Total: ~120 customers distributed across different time periods
-- Run this after the main seed.sql to populate test data

-- Get the default branch ID
DO $$
DECLARE
    default_branch_id UUID;
    statuses TEXT[] := ARRAY['prospect', 'in_progress', 'completed', 'callback', 'absent', 'cancelled'];
    categories TEXT[] := ARRAY['new_customer', 'existing', 'blacklist', 'vip'];
    korean_surnames TEXT[] := ARRAY['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    korean_names TEXT[] := ARRAY['민준', '서연', '지후', '수빈', '예준', '지아', '도윤', '하은', '시우', '지유'];
    i INTEGER;
    random_status TEXT;
    random_category TEXT;
    random_name TEXT;
    random_phone TEXT;
    random_date TIMESTAMP;
BEGIN
    -- Get the default branch
    SELECT id INTO default_branch_id FROM branches WHERE slug = 'default' LIMIT 1;

    IF default_branch_id IS NULL THEN
        RAISE EXCEPTION 'Default branch not found. Run seed.sql first.';
    END IF;

    -- Today: 5 customers
    FOR i IN 1..5 LOOP
        random_status := statuses[1 + floor(random() * 6)::int];
        random_category := categories[1 + floor(random() * 4)::int];
        random_name := korean_surnames[1 + floor(random() * 10)::int] || korean_names[1 + floor(random() * 10)::int];
        random_phone := '010' || lpad(floor(random() * 100000000)::text, 8, '0');
        random_date := NOW() - (random() * interval '12 hours');

        INSERT INTO customers (phone, name, status, category, branch_id, created_at, updated_at)
        VALUES (random_phone, random_name, random_status, random_category, default_branch_id, random_date, random_date);
    END LOOP;

    -- Yesterday: 8 customers
    FOR i IN 1..8 LOOP
        random_status := statuses[1 + floor(random() * 6)::int];
        random_category := categories[1 + floor(random() * 4)::int];
        random_name := korean_surnames[1 + floor(random() * 10)::int] || korean_names[1 + floor(random() * 10)::int];
        random_phone := '010' || lpad(floor(random() * 100000000)::text, 8, '0');
        random_date := (NOW() - interval '1 day') + (random() * interval '12 hours');

        INSERT INTO customers (phone, name, status, category, branch_id, created_at, updated_at)
        VALUES (random_phone, random_name, random_status, random_category, default_branch_id, random_date, random_date);
    END LOOP;

    -- Last 7 days (excluding today and yesterday): 7 customers (total 20 for week including above)
    FOR i IN 1..7 LOOP
        random_status := statuses[1 + floor(random() * 6)::int];
        random_category := categories[1 + floor(random() * 4)::int];
        random_name := korean_surnames[1 + floor(random() * 10)::int] || korean_names[1 + floor(random() * 10)::int];
        random_phone := '010' || lpad(floor(random() * 100000000)::text, 8, '0');
        random_date := NOW() - ((2 + floor(random() * 5)::int) * interval '1 day') + (random() * interval '12 hours');

        INSERT INTO customers (phone, name, status, category, branch_id, created_at, updated_at)
        VALUES (random_phone, random_name, random_status, random_category, default_branch_id, random_date, random_date);
    END LOOP;

    -- This month (excluding last 7 days): 30 customers (total 50 for month including above)
    FOR i IN 1..30 LOOP
        random_status := statuses[1 + floor(random() * 6)::int];
        random_category := categories[1 + floor(random() * 4)::int];
        random_name := korean_surnames[1 + floor(random() * 10)::int] || korean_names[1 + floor(random() * 10)::int];
        random_phone := '010' || lpad(floor(random() * 100000000)::text, 8, '0');
        random_date := date_trunc('month', NOW()) + (floor(random() * (EXTRACT(day FROM NOW()) - 7))::int * interval '1 day') + (random() * interval '12 hours');

        -- Only insert if date is within this month and before 7 days ago
        IF random_date < NOW() - interval '7 days' THEN
            INSERT INTO customers (phone, name, status, category, branch_id, created_at, updated_at)
            VALUES (random_phone, random_name, random_status, random_category, default_branch_id, random_date, random_date);
        END IF;
    END LOOP;

    -- Last month: 40 customers
    FOR i IN 1..40 LOOP
        random_status := statuses[1 + floor(random() * 6)::int];
        random_category := categories[1 + floor(random() * 4)::int];
        random_name := korean_surnames[1 + floor(random() * 10)::int] || korean_names[1 + floor(random() * 10)::int];
        random_phone := '010' || lpad(floor(random() * 100000000)::text, 8, '0');
        random_date := date_trunc('month', NOW() - interval '1 month') + (floor(random() * 28)::int * interval '1 day') + (random() * interval '12 hours');

        INSERT INTO customers (phone, name, status, category, branch_id, created_at, updated_at)
        VALUES (random_phone, random_name, random_status, random_category, default_branch_id, random_date, random_date);
    END LOOP;

    -- Older data: 30 customers from 2-3 months ago
    FOR i IN 1..30 LOOP
        random_status := statuses[1 + floor(random() * 6)::int];
        random_category := categories[1 + floor(random() * 4)::int];
        random_name := korean_surnames[1 + floor(random() * 10)::int] || korean_names[1 + floor(random() * 10)::int];
        random_phone := '010' || lpad(floor(random() * 100000000)::text, 8, '0');
        random_date := NOW() - ((60 + floor(random() * 30)::int) * interval '1 day') + (random() * interval '12 hours');

        INSERT INTO customers (phone, name, status, category, branch_id, created_at, updated_at)
        VALUES (random_phone, random_name, random_status, random_category, default_branch_id, random_date, random_date);
    END LOOP;

    RAISE NOTICE 'Sample customers created successfully!';
END $$;

-- Summary query to verify distribution
SELECT
    CASE
        WHEN created_at >= NOW() - interval '1 day' THEN 'Today'
        WHEN created_at >= NOW() - interval '2 days' THEN 'Yesterday'
        WHEN created_at >= NOW() - interval '7 days' THEN 'This Week'
        WHEN created_at >= date_trunc('month', NOW()) THEN 'This Month'
        WHEN created_at >= date_trunc('month', NOW() - interval '1 month')
             AND created_at < date_trunc('month', NOW()) THEN 'Last Month'
        ELSE 'Older'
    END as period,
    COUNT(*) as count
FROM customers
GROUP BY 1
ORDER BY
    CASE
        WHEN period = 'Today' THEN 1
        WHEN period = 'Yesterday' THEN 2
        WHEN period = 'This Week' THEN 3
        WHEN period = 'This Month' THEN 4
        WHEN period = 'Last Month' THEN 5
        ELSE 6
    END;
