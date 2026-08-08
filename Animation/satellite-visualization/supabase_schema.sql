-- Run this SQL in the Supabase SQL Editor to create the anomalies table

CREATE TABLE IF NOT EXISTS public.anomalies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  headline text NOT NULL,
  risk_level text NOT NULL,
  what_happened text NOT NULL,
  next_action text NOT NULL,
  precautions jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'Pending Approval' NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts and selects (for demo/development)
CREATE POLICY "Allow public read access"
  ON public.anomalies
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON public.anomalies
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON public.anomalies
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
