-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users)
create table public.profiles (
  id text primary key, -- Matches Privy user.id (e.g., "did:privy:...")
  handle text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SHELVES (One per user)
create table public.shelves (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.profiles(id) not null,
  theme_id text default 'dawn',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id) -- Enforce one shelf per user
);

-- 3. SHELF ITEMS (Items in slots)
create table public.shelf_items (
  id uuid primary key default uuid_generate_v4(),
  shelf_id uuid references public.shelves(id) on delete cascade not null,
  slot_index smallint not null check (slot_index >= 0 and slot_index < 8),
  item_key text, -- The accessory ID (e.g. "btc_statue")
  extra_data jsonb, -- For things like photo frame URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(shelf_id, slot_index) -- Max one item per slot per shelf
);

-- 4. ROW LEVEL SECURITY (RLS)
-- Since we are currently using Supabase purely as a Data Layer with the "anon" key and NO Supabase Auth context (Privy handles Auth),
-- request.auth.uid() will be null.
-- For this "Frontend-Only" stage, we must allow public access to these tables for the app to work.
-- WARNING: This allows anyone with your Anon Key to edit any shelf. 
-- In a production app with Privy + Supabase, you would set up a backend to sign JWTs or use a proxy.

alter table public.profiles enable row level security;
alter table public.shelves enable row level security;
alter table public.shelf_items enable row level security;

-- Allow Public Read (Everyone can see shelves)
create policy "Public Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Public Shelves are viewable by everyone" on public.shelves for select using (true);
create policy "Public Shelf Items are viewable by everyone" on public.shelf_items for select using (true);

-- Allow Public Insert/Update (For this architecture demo)
-- Ideally this would be narrower, e.g., checking a custom header or signature, but we'll open it for the prototype to function immediately.
create policy "Enable insert for authenticated users only" on public.profiles for insert with check (true);
create policy "Enable update for users based on email" on public.profiles for update using (true);

create policy "Enable insert for shelves" on public.shelves for insert with check (true);
create policy "Enable update for shelves" on public.shelves for update using (true);

create policy "Enable insert for items" on public.shelf_items for insert with check (true);
create policy "Enable update for items" on public.shelf_items for update using (true);
create policy "Enable delete for items" on public.shelf_items for delete using (true);
-- 4. REACTIONS (Interactions like 🔥💎)
create table public.reactions (
  id uuid primary key default uuid_generate_v4(),
  shelf_id uuid references public.shelves(id) on delete cascade not null,
  user_id text references public.profiles(id) on delete cascade,
  type text not null, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(shelf_id, user_id)
);


-- Allow everyone to see and add reactions
alter table public.reactions enable row level security;
create policy "Reactions are viewable by everyone" on public.reactions for select using (true);
create policy "Anyone can react" on public.reactions for insert with check (true);
