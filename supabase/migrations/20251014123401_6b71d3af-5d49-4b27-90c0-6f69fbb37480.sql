-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule 6 articles at 6 AM (one every 10 minutes from 6:00 to 6:50)
SELECT cron.schedule(
  'generate-article-6am-1',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6am-2',
  '10 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6am-3',
  '20 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6am-4',
  '30 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6am-5',
  '40 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6am-6',
  '50 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- Schedule 6 articles at 6 PM (one every 10 minutes from 18:00 to 18:50)
SELECT cron.schedule(
  'generate-article-6pm-1',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6pm-2',
  '10 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6pm-3',
  '20 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6pm-4',
  '30 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6pm-5',
  '40 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'generate-article-6pm-6',
  '50 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://dhecxleioabpbxzfdynw.supabase.co/functions/v1/generate-news-article',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZWN4bGVpb2FicGJ4emZkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzc2NzgsImV4cCI6MjA3NTk1MzY3OH0.Pagbbs-ci2Ly1WeDAJdoCRjNlfO-2FtYIXSW46UNrBw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);