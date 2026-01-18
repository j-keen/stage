-- Add landing_settings column to branches table
-- This allows customizing landing page text (title, description, button text, etc.)

ALTER TABLE branches
ADD COLUMN IF NOT EXISTS landing_settings JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN branches.landing_settings IS 'JSON object containing landing page customization settings: title, description, buttonText, successMessage, privacyText';
