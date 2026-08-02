-- =========================================================
-- CHAT : statut de lecture persistant
-- =========================================================

create table if not exists public.chat_read_status (
  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  last_read_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

alter table public.chat_read_status
  enable row level security;

drop policy if exists
  "members can read own chat status"
on public.chat_read_status;

create policy
  "members can read own chat status"
on public.chat_read_status
for select
to authenticated
using (profile_id = auth.uid());

drop policy if exists
  "members can create own chat status"
on public.chat_read_status;

create policy
  "members can create own chat status"
on public.chat_read_status
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists
  "members can update own chat status"
on public.chat_read_status;

create policy
  "members can update own chat status"
on public.chat_read_status
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create index if not exists
  chat_read_status_last_read_at_idx
on public.chat_read_status(last_read_at);

-- Vérifie que les messages sont bien dans Realtime.
-- Si la table y est déjà, Supabase retournera une erreur sans gravité.
-- alter publication supabase_realtime
-- add table public.chat_messages;
