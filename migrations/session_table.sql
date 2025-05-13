-- Create the sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  team TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress',
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  total_time INTEGER,
  email_sent_to TEXT
);

-- Add indexes for performance
CREATE INDEX sessions_email_idx ON sessions(email);
CREATE INDEX sessions_status_idx ON sessions(status);

-- Create webhooks for question generation
CREATE OR REPLACE FUNCTION question_generator_hook() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    pg_notify(
      'question_generator',
      json_build_object(
        'session_id', NEW.id,
        'name', NEW.name,
        'email', NEW.email
      )::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER question_generator_webhook
AFTER INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION question_generator_hook();

-- Create webhook for completion notification
CREATE OR REPLACE FUNCTION session_completion_hook() 
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'completed' AND NEW.status = 'completed' THEN
    PERFORM
      pg_notify(
        'session_completed',
        json_build_object(
          'session_id', NEW.id,
          'email', NEW.email,
          'answers', NEW.answers,
          'total_time', NEW.total_time
        )::text
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_completion_webhook
AFTER UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION session_completion_hook();

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no login required)
-- Only allow reading your own session data based on session ID
CREATE POLICY "Allow public read access to own session" ON sessions
  FOR SELECT 
  USING (id::text = current_setting('request.query.session_id', true)::text);

-- Allow public to create new sessions
CREATE POLICY "Allow public to create sessions" ON sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow public to update their own session
CREATE POLICY "Allow public to update own session" ON sessions
  FOR UPDATE
  USING (id::text = current_setting('request.query.session_id', true)::text); 