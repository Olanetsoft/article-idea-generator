-- Supabase Schema for Link Analytics
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Stores user profile information synced from auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SHORT URLS TABLE
-- Stores shortened URLs with ownership
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.short_urls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  total_clicks INTEGER DEFAULT 0 NOT NULL,
  unique_clicks INTEGER DEFAULT 0 NOT NULL
);

-- Create index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_short_urls_code ON public.short_urls(code);
CREATE INDEX IF NOT EXISTS idx_short_urls_user_id ON public.short_urls(user_id);

-- Enable RLS
ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;

-- Short URLs policies
-- Anyone can read active short URLs (needed for redirects)
CREATE POLICY "Anyone can read active short URLs" ON public.short_urls
  FOR SELECT USING (is_active = TRUE);

-- Users can read all their own URLs
CREATE POLICY "Users can read own URLs" ON public.short_urls
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create URLs (authenticated users only - user_id must match)
CREATE POLICY "Authenticated users can create URLs" ON public.short_urls
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- Users can update their own URLs
CREATE POLICY "Users can update own URLs" ON public.short_urls
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own URLs
CREATE POLICY "Users can delete own URLs" ON public.short_urls
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CLICK EVENTS TABLE
-- Stores click tracking data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.click_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  short_url_id UUID REFERENCES public.short_urls(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_hash TEXT, -- Hashed IP for privacy
  user_agent TEXT,
  fingerprint TEXT,
  country TEXT,
  country_name TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  source_type TEXT -- direct, qr, api
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_click_events_short_url_id ON public.click_events(short_url_id);
CREATE INDEX IF NOT EXISTS idx_click_events_timestamp ON public.click_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_click_events_country ON public.click_events(country);
CREATE INDEX IF NOT EXISTS idx_click_events_device_type ON public.click_events(device_type);
CREATE INDEX IF NOT EXISTS idx_click_events_source_type ON public.click_events(source_type);

-- Enable RLS
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Click events policies
-- Anyone can insert click events (for tracking)
CREATE POLICY "Anyone can insert click events" ON public.click_events
  FOR INSERT WITH CHECK (TRUE);

-- Users can read click events for their own URLs
CREATE POLICY "Users can read own URL click events" ON public.click_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.short_urls
      WHERE short_urls.id = click_events.short_url_id
      AND short_urls.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment click counts
-- SECURITY: Restricted to service_role to prevent arbitrary callers from inflating counts.
-- Only the API server (using service role key) can call this function.
CREATE OR REPLACE FUNCTION public.increment_click_count(
  url_id UUID,
  is_unique BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.short_urls
  SET 
    total_clicks = total_clicks + 1,
    unique_clicks = CASE WHEN is_unique THEN unique_clicks + 1 ELSE unique_clicks END
  WHERE id = url_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke public execute and grant only to service_role
REVOKE EXECUTE ON FUNCTION public.increment_click_count(UUID, BOOLEAN) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_click_count(UUID, BOOLEAN) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_click_count(UUID, BOOLEAN) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_click_count(UUID, BOOLEAN) TO service_role;

-- Function to get URL analytics summary (with ownership check)
CREATE OR REPLACE FUNCTION public.get_url_analytics(url_code TEXT, requesting_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_clicks BIGINT,
  unique_visitors BIGINT,
  clicks_today BIGINT,
  clicks_last_7_days BIGINT,
  clicks_last_30_days BIGINT,
  top_countries JSONB,
  top_devices JSONB,
  top_referrers JSONB,
  clicks_by_day JSONB
) AS $$
DECLARE
  url_owner_id UUID;
BEGIN
  -- Get the URL's owner
  SELECT user_id INTO url_owner_id FROM public.short_urls WHERE code = url_code;
  
  -- Check ownership if user_id is set (if null, it's an anonymous URL - allow access)
  IF url_owner_id IS NOT NULL AND (requesting_user_id IS NULL OR url_owner_id != requesting_user_id) THEN
    RAISE EXCEPTION 'Access denied: You do not own this URL';
  END IF;

  RETURN QUERY
  WITH url AS (
    SELECT id FROM public.short_urls WHERE code = url_code
  ),
  clicks AS (
    SELECT * FROM public.click_events WHERE short_url_id = (SELECT id FROM url)
  )
  SELECT
    COUNT(*)::BIGINT as total_clicks,
    COUNT(DISTINCT fingerprint)::BIGINT as unique_visitors,
    COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE)::BIGINT as clicks_today,
    COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as clicks_last_7_days,
    COUNT(*) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as clicks_last_30_days,
    (
      SELECT jsonb_agg(jsonb_build_object('country', country, 'clicks', cnt))
      FROM (
        SELECT country, COUNT(*) as cnt
        FROM clicks
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ) as top_countries,
    (
      SELECT jsonb_agg(jsonb_build_object('device', device_type, 'clicks', cnt))
      FROM (
        SELECT device_type, COUNT(*) as cnt
        FROM clicks
        WHERE device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY cnt DESC
      ) t
    ) as top_devices,
    (
      SELECT jsonb_agg(jsonb_build_object('referrer', referrer_domain, 'clicks', cnt))
      FROM (
        SELECT referrer_domain, COUNT(*) as cnt
        FROM clicks
        WHERE referrer_domain IS NOT NULL
        GROUP BY referrer_domain
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ) as top_referrers,
    (
      SELECT jsonb_agg(jsonb_build_object('date', day, 'clicks', cnt))
      FROM (
        SELECT DATE(timestamp) as day, COUNT(*) as cnt
        FROM clicks
        WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(timestamp)
        ORDER BY day
      ) t
    ) as clicks_by_day
  FROM clicks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STORAGE (for QR codes if needed)
-- ============================================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('qr-codes', 'qr-codes', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ANALYTICS SHARE TOKENS TABLE
-- Allows users to share read-only analytics with others
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_share_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  short_url_id UUID REFERENCES public.short_urls(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_analytics_share_tokens_token ON public.analytics_share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_analytics_share_tokens_short_url_id ON public.analytics_share_tokens(short_url_id);

-- Enable RLS
ALTER TABLE public.analytics_share_tokens ENABLE ROW LEVEL SECURITY;

-- Share tokens policies
-- Anyone can read active share tokens (for validation)
CREATE POLICY "Anyone can read active share tokens" ON public.analytics_share_tokens
  FOR SELECT USING (is_active = TRUE);

-- Users can create share tokens for their own URLs
CREATE POLICY "Users can create share tokens for own URLs" ON public.analytics_share_tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.short_urls
      WHERE short_urls.id = analytics_share_tokens.short_url_id
      AND short_urls.user_id = auth.uid()
    )
  );

-- Users can update/revoke their own share tokens
CREATE POLICY "Users can update own share tokens" ON public.analytics_share_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.short_urls
      WHERE short_urls.id = analytics_share_tokens.short_url_id
      AND short_urls.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.short_urls
      WHERE short_urls.id = analytics_share_tokens.short_url_id
      AND short_urls.user_id = auth.uid()
    )
  );

-- Users can delete their own share tokens
CREATE POLICY "Users can delete own share tokens" ON public.analytics_share_tokens
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.short_urls
      WHERE short_urls.id = analytics_share_tokens.short_url_id
      AND short_urls.user_id = auth.uid()
    )
  );
