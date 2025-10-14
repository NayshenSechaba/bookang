-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the appointment reminder to run daily at 9 AM
SELECT cron.schedule(
  'send-appointment-reminders-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT
    net.http_post(
        url:='https://qbkgyervpdcgzhojqfch.supabase.co/functions/v1/send-appointment-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2d5ZXJ2cGRjZ3pob2pxZmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjI4MDYsImV4cCI6MjA2ODQ5ODgwNn0.hvoQXgUUh03xNzS4d9exCS34fFvaZYLvfP3TqPL7tkg"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);