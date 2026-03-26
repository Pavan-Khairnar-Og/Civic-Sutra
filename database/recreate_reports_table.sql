-- Drop existing reports table and recreate with complete schema
DROP TABLE IF EXISTS reports CASCADE;

-- Create comprehensive reports table for Civic Sutra
CREATE TABLE reports (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- User information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    citizen_name TEXT,
    citizen_email TEXT,
    
    -- Location information
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    
    -- Report details
    title TEXT NOT NULL,
    description TEXT,
    issue_type TEXT,
    
    -- AI Analysis Results
    ai_issue_type TEXT,
    ai_confidence FLOAT,
    ai_severity TEXT,
    ai_department TEXT,
    ai_description TEXT,
    ai_reasoning TEXT,
    ai_valid BOOLEAN DEFAULT FALSE,
    
    -- Image information
    image_url TEXT,
    image_path TEXT,
    
    -- Status and workflow
    status TEXT DEFAULT 'pending',
    assigned_department TEXT,
    priority TEXT DEFAULT 'medium',
    priority_score INTEGER DEFAULT 0,
    
    -- Duplicate detection
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES reports(id),
    
    -- Community engagement
    upvotes INTEGER DEFAULT 0,
    confirmations INTEGER DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create performance indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_issue_type ON reports(issue_type);
CREATE INDEX idx_reports_priority_score ON reports(priority_score DESC);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_ai_issue_type ON reports(ai_issue_type);
CREATE INDEX idx_reports_assigned_department ON reports(assigned_department);

-- RLS Policies
-- 1. Public select access (anyone can read reports)
CREATE POLICY "Public select access" ON reports
    FOR SELECT USING (true);

-- 2. Open insert access (anyone can insert reports)
CREATE POLICY "Open insert access" ON reports
    FOR INSERT WITH CHECK (true);

-- 3. Own-record update access (users can update their own reports)
CREATE POLICY "Own record update access" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Own record delete access (users can delete their own reports)
CREATE POLICY "Own record delete access" ON reports
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate priority score based on AI analysis
CREATE OR REPLACE FUNCTION calculate_priority_score(
    p_ai_severity TEXT,
    p_ai_confidence FLOAT,
    p_ai_valid BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
    severity_score INTEGER := 0;
    confidence_score INTEGER := 0;
    valid_score INTEGER := 0;
BEGIN
    -- Severity scoring (40 points max)
    CASE p_ai_severity
        WHEN 'critical' THEN severity_score := 40;
        WHEN 'high' THEN severity_score := 30;
        WHEN 'medium' THEN severity_score := 20;
        WHEN 'low' THEN severity_score := 10;
        ELSE severity_score := 5;
    END CASE;
    
    -- Confidence scoring (30 points max)
    confidence_score := ROUND(p_ai_confidence * 30);
    
    -- Valid civic issue scoring (30 points max)
    valid_score := CASE WHEN p_ai_valid THEN 30 ELSE 0 END;
    
    RETURN severity_score + confidence_score + valid_score;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set priority and calculate score
CREATE OR REPLACE FUNCTION set_report_priority_and_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate priority score
    NEW.priority_score := calculate_priority_score(
        NEW.ai_severity,
        NEW.ai_confidence,
        NEW.ai_valid
    );
    
    -- Set priority based on score
    IF NEW.priority_score >= 80 THEN
        NEW.priority := 'critical';
    ELSIF NEW.priority_score >= 60 THEN
        NEW.priority := 'high';
    ELSIF NEW.priority_score >= 40 THEN
        NEW.priority := 'medium';
    ELSE
        NEW.priority := 'low';
    END IF;
    
    -- Set assigned department if AI provided one
    IF NEW.ai_department IS NOT NULL AND NEW.assigned_department IS NULL THEN
        NEW.assigned_department := NEW.ai_department;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate priority and score on insert
CREATE TRIGGER set_report_priority_and_score_trigger
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION set_report_priority_and_score();

-- Trigger to recalculate priority and score on AI field updates
CREATE TRIGGER update_report_priority_and_score_trigger
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION set_report_priority_and_score();

-- Function to find potential duplicate reports
CREATE OR REPLACE FUNCTION find_duplicate_reports(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_issue_type TEXT,
    p_hours_range INTEGER DEFAULT 24
) RETURNS TABLE(report_id UUID, similarity_score FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as report_id,
        -- Simple similarity scoring based on distance and issue type
        CASE 
            WHEN r.issue_type = p_issue_type THEN 
                -- Calculate distance similarity (closer = higher score)
                GREATEST(0, 1 - (
                    6371 * acos(
                        LEAST(1, 
                            GREATEST(-1,
                                cos(radians(p_latitude)) * cos(radians(r.latitude)) * 
                                cos(radians(r.longitude) - radians(p_longitude)) + 
                                sin(radians(p_latitude)) * sin(radians(r.latitude))
                            )
                        )
                    ) / 10 -- 10km radius
                ))
            ELSE 0
        END as similarity_score
    FROM reports r
    WHERE 
        -- Within specified time range
        r.created_at >= NOW() - INTERVAL '1 hour' * p_hours_range
        -- Within reasonable distance (can be adjusted)
        AND 6371 * acos(
            LEAST(1, 
                GREATEST(-1,
                    cos(radians(p_latitude)) * cos(radians(r.latitude)) * 
                    cos(radians(r.longitude) - radians(p_longitude)) + 
                    sin(radians(p_latitude)) * sin(radians(r.latitude))
                )
            ) <= 5 -- 5km radius
        -- Same issue type
        AND r.issue_type = p_issue_type
        -- Not already marked as duplicate
        AND r.is_duplicate = FALSE
        -- Exclude own report
        AND r.id != NEW.id
    ORDER BY similarity_score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- View for reports with user information (for admin dashboards)
CREATE OR REPLACE VIEW reports_with_users AS
SELECT 
    r.*,
    u.email as user_email,
    u.user_metadata as user_metadata
FROM reports r
LEFT JOIN auth.users u ON r.user_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON reports_with_users TO authenticated;
GRANT SELECT ON reports_with_users TO anon;
