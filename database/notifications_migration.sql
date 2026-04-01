-- Notification System Migration for CivicSutra

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

CREATE TABLE IF NOT EXISTS notification_queue (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  issue_id    UUID NOT NULL,
  sent        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_prefs_updated_at
  BEFORE UPDATE ON notification_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prefs" ON notification_prefs
  FOR ALL USING (auth.uid() = user_id);
