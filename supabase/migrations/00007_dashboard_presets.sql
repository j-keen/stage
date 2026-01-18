-- Dashboard presets table for user-specific preset storage
CREATE TABLE IF NOT EXISTS dashboard_presets (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
name TEXT NOT NULL,
widgets JSONB NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dashboard_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own presets
CREATE POLICY "Users can view their own presets"
ON dashboard_presets FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert their own presets
CREATE POLICY "Users can insert their own presets"
ON dashboard_presets FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own presets
CREATE POLICY "Users can update their own presets"
ON dashboard_presets FOR UPDATE
USING (user_id = auth.uid());

-- Policy: Users can delete their own presets
CREATE POLICY "Users can delete their own presets"
ON dashboard_presets FOR DELETE
USING (user_id = auth.uid());

-- Index for faster user queries
CREATE INDEX idx_dashboard_presets_user_id ON dashboard_presets(user_id);
CREATE INDEX idx_dashboard_presets_created_at ON dashboard_presets(created_at DESC);
