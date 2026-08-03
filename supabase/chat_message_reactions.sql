-- =========================================================
-- CHAT — RÉACTIONS AUX MESSAGES
-- À exécuter une seule fois dans l’éditeur SQL Supabase
-- =========================================================

create table if not exists
  public.chat_message_reactions (
    id uuid primary key
      default gen_random_uuid(),

    message_id uuid not null
      references public.chat_messages(id)
      on delete cascade,

    profile_id uuid not null
      references public.profiles(id)
      on delete cascade,

    emoji text not null
      check (
        char_length(trim(emoji))
          between 1 and 24
      ),

    created_at timestamptz not null
      default now(),

    constraint
      chat_message_reactions_unique
    unique (
      message_id,
      profile_id,
      emoji
    )
  );

create index if not exists
  chat_message_reactions_message_idx
on public.chat_message_reactions (
  message_id
);

create index if not exists
  chat_message_reactions_profile_idx
on public.chat_message_reactions (
  profile_id
);

alter table
  public.chat_message_reactions
enable row level security;

drop policy if exists
  "chat reactions readable by members"
on public.chat_message_reactions;

create policy
  "chat reactions readable by members"
on public.chat_message_reactions
for select
to authenticated
using (true);

drop policy if exists
  "members can add own chat reactions"
on public.chat_message_reactions;

create policy
  "members can add own chat reactions"
on public.chat_message_reactions
for insert
to authenticated
with check (
  profile_id = auth.uid()
);

drop policy if exists
  "members can remove own chat reactions"
on public.chat_message_reactions;

create policy
  "members can remove own chat reactions"
on public.chat_message_reactions
for delete
to authenticated
using (
  profile_id = auth.uid()
);

-- Ajout à Realtime uniquement si la table
-- n'est pas déjà publiée.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname =
        'supabase_realtime'
      and schemaname =
        'public'
      and tablename =
        'chat_message_reactions'
  ) then
    alter publication
      supabase_realtime
    add table
      public.chat_message_reactions;
  end if;
end;
$$;
