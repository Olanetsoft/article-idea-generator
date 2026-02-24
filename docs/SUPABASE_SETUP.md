# Supabase Setup Guide

This guide explains how to set up Supabase for the URL shortener with Google authentication and link analytics.

## Prerequisites

1. A Supabase account (free tier works fine)
2. A Google Cloud Console account for OAuth

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: Your project name (e.g., "article-idea-generator")
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy the entire contents and paste it into the SQL Editor
4. Click "Run" to execute the schema

This creates:

- `profiles` table for user data
- `short_urls` table for shortened URLs
- `click_events` table for analytics
- Row Level Security (RLS) policies
- Necessary functions and triggers

## Step 3: Configure Google OAuth

### In Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** > **OAuth consent screen**
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth client ID**
   - Application type: **Web application**
   - Name: Your app name
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com`
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com/auth/callback`
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Save the **Client ID** and **Client Secret**

### In Supabase:

1. Go to **Authentication** > **Providers**
2. Find **Google** and enable it
3. Enter your Google **Client ID** and **Client Secret**
4. Save changes

## Step 4: Configure Environment Variables

Create or update your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Site URL (for auth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Finding Your Supabase Keys:

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) > **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Configure Authentication URLs

In Supabase dashboard:

1. Go to **Authentication** > **URL Configuration**
2. Set:
   - **Site URL**: `http://localhost:3000` (for dev) or your production URL
   - **Redirect URLs**: Add all allowed redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com/auth/callback`

## Step 6: Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/tools/url-shortener`

3. Click "Sign in with Google" in the header

4. After signing in, create a short URL - it should be saved to Supabase

5. Check your dashboard at `/dashboard` to see your links and analytics

## Features

### For Anonymous Users:

- Create short URLs (saved to database, but without user association)
- QR code generation for any shortened link
- Copy short links to clipboard
- Local link history in browser
- Redirects work for all URLs

### For Signed-in Users:

- All anonymous features, plus:
- Links associated with your account
- Links synced across devices
- Persistent storage in Supabase
- Detailed analytics dashboard with:
  - Click counts (total, unique, QR scans)
  - Geographic breakdown (country, city)
  - Device and browser statistics
  - Traffic source analysis
  - Referrer tracking
  - Timeline data
  - Recent click history
- Dashboard for managing all links

## Database Schema

### Tables:

**profiles**

- `id` (UUID, references auth.users)
- `email` (text)
- `full_name` (text)
- `avatar_url` (text)
- `created_at`, `updated_at` (timestamps)

**short_urls**

- `id` (UUID)
- `user_id` (UUID, nullable - anonymous URLs allowed)
- `code` (varchar 10, unique)
- `original_url` (text)
- `title` (text)
- `click_count`, `unique_click_count`, `qr_scan_count` (integers)
- `created_at`, `updated_at` (timestamps)

**click_events**

- `id` (UUID)
- `short_url_id` (UUID, references short_urls)
- `ip_hash` (varchar 64 - hashed for privacy)
- `user_agent`, `referrer` (text)
- `country`, `city` (varchar)
- `device_type`, `browser`, `os` (varchar)
- `source_type` (varchar - 'direct' or 'qr')
- `utm_source`, `utm_medium`, `utm_campaign` (varchar)
- `fingerprint` (varchar - for unique visitor tracking)
- `is_unique` (boolean)
- `created_at` (timestamp)

## Troubleshooting

### "Invalid API key" error

- Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Make sure you're using the **anon** key, not the service role key

### Google OAuth not working

- Verify redirect URIs match exactly in Google Console and Supabase
- Check that Google provider is enabled in Supabase Authentication settings
- Ensure your Google Cloud project has the OAuth consent screen configured

### RLS Policy errors

- Make sure you ran the full `schema.sql` file
- Check that RLS is enabled on all tables
- Verify policies were created (check in Supabase > Table Editor > Policies)

### Data not appearing in dashboard

- Check browser console for API errors
- Verify the user is properly authenticated
- Check Supabase logs in the dashboard

## Production Deployment

1. Update environment variables in your hosting platform (Vercel, etc.)
2. Update Google OAuth redirect URIs with production domain
3. Update Supabase URL Configuration with production URL
4. Test the complete flow on production
