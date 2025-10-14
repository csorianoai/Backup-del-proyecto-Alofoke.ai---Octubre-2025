-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the news generation function to run every 6 hours
SELECT cron.schedule(
  'generate-ai-news-every-6-hours',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) AS request_id;
  $$
);