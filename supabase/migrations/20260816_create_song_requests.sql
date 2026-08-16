-- =======================================================
-- MIGRATION: Create song_requests table for DJ Posaxa
-- =======================================================

CREATE TABLE IF NOT EXISTS public.song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_art TEXT,
  preview_url TEXT,
  requester_name TEXT DEFAULT 'Anònim',
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'played', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public / anonymous / authenticated) to submit a song request
CREATE POLICY "Allow public insert to song_requests" 
ON public.song_requests 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow anyone to view song requests for the public live feed
CREATE POLICY "Allow public select on song_requests" 
ON public.song_requests 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow service role and admins to update status or delete
CREATE POLICY "Allow full access for authenticated/service role" 
ON public.song_requests 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);
