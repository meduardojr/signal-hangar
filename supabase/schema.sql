-- ================================================================
-- SignalHangar — Supabase Database Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- Enable UUID support (already on by default on Supabase)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- TABLE: prompts
-- ----------------------------------------------------------------
create table if not exists prompts (
  id            uuid         primary key default gen_random_uuid(),
  title         text         not null,
  description   text         not null default '',
  content       text         not null,
  rating        numeric(3,1) not null default 0.0
                             check (rating >= 0.0 and rating <= 5.0),
  project_types text[]       not null default '{}',
  keywords      text[]       not null default '{}',
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

-- Auto-stamp updated_at on every row update
create or replace function set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_prompts_updated_at on prompts;
create trigger trg_prompts_updated_at
  before update on prompts
  for each row execute function set_updated_at();

-- Indexes for filtering / sorting hot paths
create index if not exists idx_prompts_project_types on prompts using gin (project_types);
create index if not exists idx_prompts_keywords      on prompts using gin (keywords);
create index if not exists idx_prompts_updated_at    on prompts (updated_at desc);
create index if not exists idx_prompts_rating        on prompts (rating desc);

-- ----------------------------------------------------------------
-- TABLE: change_log
-- Stores one row per create / update / delete event on prompts.
-- prompt_id is nullable (ON DELETE SET NULL) so history is
-- preserved even after a prompt is deleted.
-- ----------------------------------------------------------------
create table if not exists change_log (
  id            uuid         primary key default gen_random_uuid(),
  prompt_id     uuid         references prompts(id) on delete set null,
  prompt_title  text         not null,
  action        text         not null check (action in ('created','updated','deleted')),
  changes       jsonb,       -- [{field, from, to}, …]  only on 'updated'
  prev_rating   numeric(3,1),  -- only when rating changed
  new_rating    numeric(3,1),  -- only when rating changed
  created_at    timestamptz  not null default now()
);

create index if not exists idx_change_log_prompt_id  on change_log (prompt_id);
create index if not exists idx_change_log_created_at on change_log (created_at desc);

-- ----------------------------------------------------------------
-- ROW-LEVEL SECURITY
-- Permissive policies — suitable for a single-user personal tool
-- using the anon key. To add per-user isolation:
--   1. Add  user_id uuid not null default auth.uid()  to both tables.
--   2. Enable Supabase Auth.
--   3. Replace the policies below with:
--        using (auth.uid() = user_id)
-- ----------------------------------------------------------------
alter table prompts    enable row level security;
alter table change_log enable row level security;

drop policy if exists "anon_all_prompts"    on prompts;
drop policy if exists "anon_all_change_log" on change_log;

create policy "anon_all_prompts"
  on prompts for all using (true) with check (true);

create policy "anon_all_change_log"
  on change_log for all using (true) with check (true);

-- ----------------------------------------------------------------
-- SEED DATA — three example prompts (safe to delete)
-- ----------------------------------------------------------------
insert into prompts (title, description, content, rating, project_types, keywords) values
(
  'Full-Stack SaaS Boilerplate',
  'Complete starter with auth, billing & dashboard',
  E'Build a production-ready SaaS application with the following specifications:\n\nARCHITECTURE:\n- Use Next.js 14 with App Router\n- Implement MVC pattern strictly separating concerns\n- Use TypeScript throughout with strict mode enabled\n\nAUTHENTICATION:\n- Implement JWT-based auth with refresh tokens (idempotent token generation)\n- OAuth2 integration (Google, GitHub)\n- Role-based access control (admin, user, viewer)\n\nBILLING:\n- Stripe integration with webhooks\n- Subscription tiers: Free, Pro ($29/mo), Enterprise\n- Usage metering for API calls\n\nDATABASE:\n- PostgreSQL with Prisma ORM\n- Implement repository pattern for data access\n- Database migrations with rollback support\n\nFRONTEND:\n- Tailwind CSS with shadcn/ui components\n- Dark/light mode toggle\n- Responsive dashboard layout',
  4.8,
  array['Website','SaaS','Dashboard'],
  array['MVC','idempotency','JWT','OAuth2','Stripe','repository-pattern']
),
(
  'E-Commerce Product Catalog',
  'Full product catalog with cart and checkout',
  E'Create a complete e-commerce product catalog:\n\nPRODUCT MANAGEMENT:\n- Product listings with variants (size, color, quantity)\n- Category and subcategory hierarchy\n- Image gallery with zoom functionality\n- Inventory tracking with low-stock alerts\n\nCART & CHECKOUT:\n- Persistent cart (localStorage + server sync)\n- Guest and authenticated checkout\n- Multi-step checkout with address validation\n- Payment gateway integration (Stripe/PayPal)\n\nSEARCH & FILTER:\n- Full-text search with Typesense\n- Faceted filtering (price range, category, rating)\n- Sort by: relevance, price, newest, best-selling\n\nPERFORMANCE:\n- Image optimization and lazy loading\n- CDN integration for static assets\n- Redis caching for product data',
  4.5,
  array['E-Commerce','Website'],
  array['REST-API','caching','lazy-loading','search','pagination']
),
(
  '2D Platformer Game Engine',
  'Browser-based 2D platformer with physics',
  E'Build a 2D platformer game with the following features:\n\nENGINE:\n- Canvas-based rendering at 60fps using requestAnimationFrame\n- Entity-Component-System (ECS) architecture\n- Fixed timestep physics loop (16.67ms)\n\nPHYSICS:\n- AABB collision detection\n- Gravity and jump mechanics with coyote time (150ms)\n- Moving platforms and one-way platforms\n\nPLAYER:\n- Smooth movement with acceleration/deceleration\n- Jump buffering (100ms)\n- Double jump and wall-jump abilities\n\nLEVEL DESIGN:\n- Tilemap system with JSON level format\n- Parallax scrolling backgrounds\n- Enemy AI with patrol and chase states using FSM',
  4.2,
  array['Game'],
  array['ECS','FSM','physics','collision-detection','game-loop']
);

-- Seed matching change_log entries
insert into change_log (prompt_id, prompt_title, action)
select id, title, 'created' from prompts;
