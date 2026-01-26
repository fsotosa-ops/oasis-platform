-- =====================================================
-- OASIS Digital Portal - Supabase Schema v2 (SECURE)
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- =====================================================
-- ENUMS
-- =====================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'collaborator', 'participant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_type AS ENUM ('sponsor', 'school', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE survey_type AS ENUM ('pre', 'post', '3m', '6m');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chat_mode AS ENUM ('coach', 'mentor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Organizations Table
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type org_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (Extends Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role default 'participant'::user_role,
  organization_id uuid references organizations(id),
  health_score float, -- 0 to 10 scale (PRIVATE - only visible to user and admins)
  nps_last_rating int,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workshops Table
create table if not exists workshops (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamp with time zone not null,
  status text default 'scheduled',
  organization_id uuid references organizations(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Surveys Table
create table if not exists surveys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) not null,
  workshop_id uuid references workshops(id),
  type survey_type not null,
  answers_json jsonb not null default '{}'::jsonb,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat Logs Table
create table if not exists chat_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  mode chat_mode not null,
  message text not null,
  response text not null,
  sentiment_score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents for RAG
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table workshops enable row level security;
alter table surveys enable row level security;
alter table chat_logs enable row level security;
alter table documents enable row level security;

-- =====================================================
-- DROP EXISTING INSECURE POLICIES
-- =====================================================
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

-- =====================================================
-- SECURE POLICIES - PROFILES
-- =====================================================

-- Users can only view their own profile (SELECT)
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Users can insert their own profile on signup
create policy "Users can create own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile (but not role)
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =====================================================
-- SECURE POLICIES - ORGANIZATIONS
-- =====================================================

-- All authenticated users can view organizations
create policy "Authenticated users can view organizations"
  on organizations for select
  to authenticated
  using (true);

-- Only admins can manage organizations
create policy "Admins can manage organizations"
  on organizations for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- =====================================================
-- SECURE POLICIES - WORKSHOPS
-- =====================================================

-- All authenticated users can view workshops
create policy "Authenticated users can view workshops"
  on workshops for select
  to authenticated
  using (true);

-- Admins and collaborators can insert workshops
create policy "Admins can insert workshops"
  on workshops for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'collaborator')
    )
  );

-- Admins can update/delete workshops
create policy "Admins can update workshops"
  on workshops for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete workshops"
  on workshops for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- =====================================================
-- SECURE POLICIES - SURVEYS
-- =====================================================

-- Users can view their own surveys
create policy "Users can view own surveys"
  on surveys for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can view all surveys
create policy "Admins can view all surveys"
  on surveys for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Users can insert their own surveys
create policy "Users can create own surveys"
  on surveys for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own surveys
create policy "Users can update own surveys"
  on surveys for update
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- SECURE POLICIES - CHAT LOGS
-- =====================================================

-- Users can view their own chat logs
create policy "Users can view own chat logs"
  on chat_logs for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can view all chat logs (for analysis)
create policy "Admins can view all chat logs"
  on chat_logs for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Users can insert their own chat logs
create policy "Users can create own chat logs"
  on chat_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =====================================================
-- SECURE POLICIES - DOCUMENTS (RAG)
-- =====================================================

-- All authenticated users can read documents
create policy "Authenticated users can read documents"
  on documents for select
  to authenticated
  using (true);

-- Only admins can manage documents
create policy "Admins can manage documents"
  on documents for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- =====================================================
-- HELPER FUNCTION: Auto-create profile on signup
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
