-- Database Triggers
-- 자동 이력 관리 및 업데이트 트리거

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track customer changes
CREATE OR REPLACE FUNCTION track_customer_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Get current user id from context (set by application)
  current_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;

  -- Track changes for each relevant field
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'phone', OLD.phone, NEW.phone);
  END IF;

  IF OLD.name IS DISTINCT FROM NEW.name THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'name', OLD.name, NEW.name);
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'status', OLD.status::TEXT, NEW.status::TEXT);
  END IF;

  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
  END IF;

  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'notes', OLD.notes, NEW.notes);
  END IF;

  IF OLD.callback_date IS DISTINCT FROM NEW.callback_date THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'callback_date', OLD.callback_date::TEXT, NEW.callback_date::TEXT);
  END IF;

  IF OLD.loan_amount IS DISTINCT FROM NEW.loan_amount THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'loan_amount', OLD.loan_amount::TEXT, NEW.loan_amount::TEXT);
  END IF;

  IF OLD.credit_score IS DISTINCT FROM NEW.credit_score THEN
    INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
    VALUES (NEW.id, current_user_id, 'credit_score', OLD.credit_score::TEXT, NEW.credit_score::TEXT);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply customer change tracking trigger
CREATE TRIGGER track_customer_changes_trigger
  AFTER UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION track_customer_changes();

-- Function to mark duplicates on insert
CREATE OR REPLACE FUNCTION check_duplicate_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM customers
    WHERE phone = NEW.phone
    AND id != NEW.id
  ) THEN
    NEW.is_duplicate = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply duplicate check trigger
CREATE TRIGGER check_duplicate_trigger
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION check_duplicate_on_insert();

-- Function to create initial history entry on customer creation
CREATE OR REPLACE FUNCTION create_initial_customer_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_histories (customer_id, user_id, field_name, old_value, new_value)
  VALUES (NEW.id, NULL, 'created', NULL, 'Customer created');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply initial history trigger
CREATE TRIGGER create_initial_history_trigger
  AFTER INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION create_initial_customer_history();
