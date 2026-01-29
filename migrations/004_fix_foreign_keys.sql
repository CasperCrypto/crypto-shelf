-- Migration 004: Fix Foreign Keys & Standardize IDs
-- Fixes "Key is still referenced from table shelves" and "Key is not present in table skins"

-- 1. Standardize skin IDs in existing shelves
UPDATE public.shelves SET skin_id = 'classic' WHERE skin_id = 'classic_wood';

-- 2. Update Foreign Key constraints to allow safe deletion
-- Skin FK
ALTER TABLE public.shelves 
DROP CONSTRAINT IF EXISTS shelves_skin_id_fkey,
ADD CONSTRAINT shelves_skin_id_fkey 
  FOREIGN KEY (skin_id) REFERENCES public.skins(id) 
  ON DELETE SET NULL;

-- Theme FK
ALTER TABLE public.shelves 
DROP CONSTRAINT IF EXISTS shelves_theme_id_fkey,
ADD CONSTRAINT shelves_theme_id_fkey 
  FOREIGN KEY (theme_id) REFERENCES public.themes(id) 
  ON DELETE SET NULL;

-- 3. Ensure the 'classic' skin exists (it should, but just in case)
INSERT INTO public.skins (id, name, type, frame_color, image_path)
VALUES ('classic', 'Classic Wood', 'IMAGE', '#8B5E3C', 'assets/skins/wood_shelf.png')
ON CONFLICT (id) DO NOTHING;
