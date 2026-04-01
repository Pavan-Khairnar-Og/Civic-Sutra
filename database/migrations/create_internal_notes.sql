-- CREATE INTERNAL NOTES TABLE
CREATE TABLE IF NOT EXISTS issue_internal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE issue_internal_notes ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES
CREATE POLICY "Only admins can access internal notes" ON issue_internal_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gov')
    )
  );
