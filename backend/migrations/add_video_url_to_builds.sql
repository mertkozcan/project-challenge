-- Add video_url column to builds table
ALTER TABLE builds
ADD COLUMN IF NOT EXISTS video_url TEXT;
