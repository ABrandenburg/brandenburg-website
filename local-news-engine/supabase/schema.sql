-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- POSTS Table
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text, -- Can store Markdown or JSON
  published_at timestamp with time zone,
  is_newsletter_sent boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- AD SLOTS Table
create table public.ad_slots (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null, -- e.g. 'top_banner', 'sidebar'
  image_url text,
  link_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- SUBSCRIBERS Table
create table public.subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  subscribed_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table public.posts enable row level security;
alter table public.ad_slots enable row level security;
alter table public.subscribers enable row level security;

-- POLICIES

-- Posts: Everyone can view published posts
create policy "Public posts are viewable by everyone" 
  on public.posts for select 
  using (published_at is not null and published_at <= now());

-- Posts: Admin has full access
create policy "Admins can do everything with posts" 
  on public.posts for all 
  using (auth.role() = 'service_role' or auth.jwt() ->> 'email' = current_setting('request.jwt.claim.email', true)); 
  -- Note: The above admin check is a placeholder. 
  -- For simple setup, we might stick to service_role or a specific user UUID if known.
  -- Better approach for now: relying on authenticated users being admins if we restrict signups, 
  -- or just service_role for backend scripts.
  -- Let's use a simpler "Authenticated users can CRUD" if we assume only Admin can log in.
  
create policy "Authenticated users can manage posts" 
  on public.posts for all 
  to authenticated 
  using (true);

-- Ad Slots: Everyone can view active ads
create policy "Active ads are viewable by everyone" 
  on public.ad_slots for select 
  using (is_active = true);

-- Ad Slots: Authenticated users can manage
create policy "Authenticated users can manage ads" 
  on public.ad_slots for all 
  to authenticated 
  using (true);

-- Subscribers: Public can insert (signup)
create policy "Anyone can subscribe" 
  on public.subscribers for insert 
  with check (true);

-- Subscribers: Authenticated users can view/manage
create policy "Authenticated users can manage subscribers" 
  on public.subscribers for all 
  to authenticated 
  using (true);
