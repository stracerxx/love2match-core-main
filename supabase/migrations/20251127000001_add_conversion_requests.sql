-- Create conversion_requests table for LOVE to LOVE2 token conversion with admin approval
CREATE TABLE IF NOT EXISTS conversion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_token VARCHAR(10) NOT NULL,
  to_token VARCHAR(10) NOT NULL,
  amount NUMERIC(20, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  admin_notes TEXT,
  transaction_signature VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_conversion_requests_user_id ON conversion_requests(user_id);
CREATE INDEX idx_conversion_requests_status ON conversion_requests(status);
CREATE INDEX idx_conversion_requests_requested_at ON conversion_requests(requested_at DESC);

-- Add RLS policies
ALTER TABLE conversion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversion requests
CREATE POLICY "Users can view own conversion requests"
  ON conversion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create conversion requests
CREATE POLICY "Users can create conversion requests"
  ON conversion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all conversion requests
CREATE POLICY "Admins can view all conversion requests"
  ON conversion_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update conversion requests
CREATE POLICY "Admins can update conversion requests"
  ON conversion_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversion_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversion_requests_updated_at
  BEFORE UPDATE ON conversion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_conversion_requests_updated_at();
