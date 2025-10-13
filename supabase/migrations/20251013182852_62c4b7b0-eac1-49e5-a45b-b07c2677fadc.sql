-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the appointment reminder function to run daily at 9 AM
SELECT cron.schedule(
  'send-appointment-reminders-daily',
  '0 9 * * *', -- Run at 9:00 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://qbkgyervpdcgzhojqfch.supabase.co/functions/v1/send-appointment-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2d5ZXJ2cGRjZ3pob2pxZmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjI4MDYsImV4cCI6MjA2ODQ5ODgwNn0.hvoQXgUUh03xNzS4d9exCS34fFvaZYLvfP3TqPL7tkg"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
