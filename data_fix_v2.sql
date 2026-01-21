-- Final Sync for Gamer Skins and Accessories
-- 1. Ensure the skins table supports our new CSS-only type
ALTER TABLE public.skins ADD COLUMN IF NOT EXISTS type text DEFAULT 'IMAGE';
ALTER TABLE public.skins ADD COLUMN IF NOT EXISTS image_path text;
ALTER TABLE public.skins ALTER COLUMN image_url DROP NOT NULL;

-- 2. Clean and Reset Skins with the high-fidelity Gamer Skins
TRUNCATE public.skins CASCADE;

-- 3. Insert the Final "Grand Rename" Skins (Clean & Simplified)
INSERT INTO public.skins (id, name, type, frame_color, image_path, image_url) VALUES
('classic', 'Classic', 'IMAGE', '#8B5E3C', 'assets/skins/wood_shelf.png', ''),
('gold', 'Gold', 'IMAGE', '#D4AF37', 'assets/skins/gold_shelf.png', ''),
('pink', 'Pink', 'IMAGE', '#F48FB1', 'assets/skins/pink_shelf.png', ''),
('mystic', 'Mystic', 'IMAGE', '#2E7D32', 'assets/skins/ice_shelf.jpg', ''), -- Swapped per user request
('diamond', 'Diamond', 'IMAGE', '#A5D6A7', 'assets/skins/mystic_shelf.png', ''); -- Swapped per user request

-- 4. Update existing shelves to default 'classic' if they point to old/deleted skins
UPDATE public.shelves 
SET skin_id = 'classic' 
WHERE skin_id NOT IN ('classic', 'gold', 'pink', 'mystic', 'diamond');

-- 5. Force schema reload
NOTIFY pgrst, 'reload schema';
