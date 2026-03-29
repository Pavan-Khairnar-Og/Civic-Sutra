-- Notification System Migration for CivicSutra

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_prefs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  status_changed  BOOLEAN DEFAULT TRUE,
  new_comment     BOOLEAN DEFAULT TRUE,
  issue_resolved  BOOLEAN DEFAULT TRUE,
  email_digest    TEXT DEFAULT 'instant' CHECK (email_digest IN ('instant','daily','weekly','none')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create notification queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  issue_id    UUID NOT NULL,
  sent        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification_prefs
CREATE TRIGGER notification_prefs_updated_at
  BEFORE UPDATE ON notification_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;

-- Create policy for notification_prefs
CREATE POLICY "Users manage own prefs" ON notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- Enable Row Level Security for notification_queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for notification_queue
CREATE POLICY "Users manage own queue" ON notification_queue
  FOR ALL USING (auth.uid() = user_id);
