# Production Deployment Guide

## Prerequisites
- Supabase project with URL and anon key set in environment variables
- Vercel deployment configured

## Step 1: Run Database Migration

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration file: `migrations/001_production_ready.sql`

This will:
- Add `email` and `role` columns to profiles
- Add `skin_id` column to shelves
- Update slot limits from 8 to 15
- Create `accessories`, `skins`, and `themes` tables
- Add performance indexes
- Seed initial data (accessories, skins, themes)

## Step 2: Verify Environment Variables

Ensure these are set in Vercel:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PRIVY_APP_ID=your_privy_app_id
```

## Step 3: Deploy

```bash
git add .
git commit -m "Production-ready refactor: Supabase integration"
git push
```

Vercel will automatically build and deploy.

## What Changed

### Database
- **New Tables**: accessories, skins, themes
- **Updated**: shelf_items now supports 15 slots (3-4-4-4 layout)
- **Seeded Data**: Initial accessories, skins, and themes

### Code
- **Removed**: localStorage dependency for shelves/reactions
- **Added**: Real-time Supabase subscriptions for reactions
- **Added**: Device ID system for stable user identity
- **Updated**: All data fetching now uses Supabase

### Features
- Admin panel for managing accessories/skins
- Real-time reaction updates
- Proper user persistence across sessions
- 15-slot shelf layout support

## Admin Access

Admin role is automatically granted to:
- Email: `hermescrypto33@gmail.com`

## Troubleshooting

### "No accessories found"
- Check that migration ran successfully
- Verify Supabase RLS policies allow public read
- Check browser console for errors

### "Shelves not loading"
- Verify Supabase connection in browser console
- Check that profiles table has data
- Ensure RLS policies are configured

### Build errors
- Run `npm run build` locally first
- Check for TypeScript/ESLint errors
- Verify all imports are correct

## Next Steps

After deployment:
1. Test shelf creation and saving
2. Verify reactions work in real-time
3. Test admin panel (accessories/skins upload)
4. Check mobile responsiveness
