-- Production-Ready Migration (Compatible with existing schema)
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- 2. Add skin_id to shelves
ALTER TABLE public.shelves ADD COLUMN IF NOT EXISTS skin_id text DEFAULT 'classic';

-- 3. Update shelf_items slot_index constraint for 15 slots (3-4-4-4 layout)
ALTER TABLE public.shelf_items DROP CONSTRAINT IF EXISTS shelf_items_slot_index_check;
ALTER TABLE public.shelf_items ADD CONSTRAINT shelf_items_slot_index_check 
  CHECK (slot_index >= 0 AND slot_index < 15);

-- 4. Handle accessories table (may already exist with different schema)
DO $$ 
BEGIN
    -- Check if accessories table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accessories') THEN
        -- Create new table
        CREATE TABLE public.accessories (
            id text PRIMARY KEY,
            name text NOT NULL,
            category text NOT NULL,
            rarity text NOT NULL,
            image text NOT NULL,
            is_active boolean DEFAULT true,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- Add optional columns if they don't exist
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS is_photo_frame boolean DEFAULT false;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS image_path text;

-- 5. Create skins table
CREATE TABLE IF NOT EXISTS public.skins (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text DEFAULT 'IMAGE',
  frame_color text DEFAULT '#8B5E3C',
  image_url text,
  image_path text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Handle themes table (may already exist with different schema)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'themes') THEN
        CREATE TABLE public.themes (
            id text PRIMARY KEY,
            name text NOT NULL,
            type text NOT NULL,
            value text,
            frame_color text NOT NULL DEFAULT '#8B5E3C',
            page_background text,
            image_url text,
            image_path text,
            is_active boolean DEFAULT true,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- Add optional columns if they don't exist
ALTER TABLE public.themes ADD COLUMN IF NOT EXISTS page_background text;
ALTER TABLE public.themes ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.themes ADD COLUMN IF NOT EXISTS image_path text;

-- 7. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_shelves_user_id ON public.shelves(user_id);
CREATE INDEX IF NOT EXISTS idx_shelf_items_shelf_id ON public.shelf_items(shelf_id);
CREATE INDEX IF NOT EXISTS idx_reactions_shelf_id ON public.reactions(shelf_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_accessories_category ON public.accessories(category);
CREATE INDEX IF NOT EXISTS idx_accessories_is_active ON public.accessories(is_active);

-- 8. Enable RLS on new tables
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- 9. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Accessories are viewable by everyone" ON public.accessories;
DROP POLICY IF EXISTS "Enable insert for accessories" ON public.accessories;
DROP POLICY IF EXISTS "Enable update for accessories" ON public.accessories;
DROP POLICY IF EXISTS "Enable delete for accessories" ON public.accessories;

-- 10. RLS Policies for accessories
CREATE POLICY "Accessories are viewable by everyone" 
  ON public.accessories FOR SELECT USING (true);
CREATE POLICY "Enable insert for accessories" 
  ON public.accessories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for accessories" 
  ON public.accessories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for accessories" 
  ON public.accessories FOR DELETE USING (true);

-- 11. RLS Policies for skins
CREATE POLICY "Skins are viewable by everyone" 
  ON public.skins FOR SELECT USING (true);
CREATE POLICY "Enable insert for skins" 
  ON public.skins FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for skins" 
  ON public.skins FOR UPDATE USING (true);
CREATE POLICY "Enable delete for skins" 
  ON public.skins FOR DELETE USING (true);

-- 12. RLS Policies for themes
CREATE POLICY "Themes are viewable by everyone" 
  ON public.themes FOR SELECT USING (true);
CREATE POLICY "Enable insert for themes" 
  ON public.themes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for themes" 
  ON public.themes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for themes" 
  ON public.themes FOR DELETE USING (true);

-- 13. Seed skins (safe with ON CONFLICT)
INSERT INTO public.skins (id, name, type, frame_color, image_path) VALUES
  ('classic', 'Classic', 'IMAGE', '#8B5E3C', 'assets/skins/wood_shelf.png'),
  ('gold', 'Gold', 'IMAGE', '#D4AF37', 'assets/skins/gold_shelf.png'),
  ('pink', 'Pink', 'IMAGE', '#F48FB1', 'assets/skins/pink_shelf.png'),
  ('mystic', 'Mystic', 'IMAGE', '#2E7D32', 'assets/skins/mystic_shelf.png'),
  ('diamond', 'Diamond', 'IMAGE', '#A5D6A7', 'assets/skins/ice_shelf.jpg')
ON CONFLICT (id) DO NOTHING;

-- 14. Seed themes (safe with ON CONFLICT)
INSERT INTO public.themes (id, name, type, value, frame_color, page_background) VALUES
  ('dawn', 'Early Morning', 'GRADIENT', 'var(--grad-morning)', '#FFF5EC', '#FFF5EC'),
  ('sky', 'Blue Sky', 'GRADIENT', 'var(--grad-sky)', '#E3F2FD', '#E3F2FD'),
  ('mint', 'Fresh Mint', 'GRADIENT', 'var(--grad-mint)', '#E8F5E9', '#E8F5E9'),
  ('sunset', 'Sunset Glow', 'GRADIENT', 'var(--grad-sunset)', '#FFF3E0', '#FFF3E0'),
  ('night', 'Midnight', 'GRADIENT', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', '#0f3460', '#0f3460')
ON CONFLICT (id) DO NOTHING;

-- 15. Update existing shelves to have default skin
UPDATE public.shelves SET skin_id = 'classic' WHERE skin_id IS NULL;

-- Done! Schema is now production-ready.
-- Note: Accessories seeding is skipped since the table already has data.
