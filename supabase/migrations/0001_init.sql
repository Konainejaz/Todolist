create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key,
  email citext not null unique,
  name text,
  password_hash text not null,
  is_guest boolean not null default false,
  password_reset_otp_hash text,
  password_reset_otp_expires_at timestamptz,
  password_reset_otp_attempts integer,
  password_reset_otp_last_sent_at timestamptz,
  reset_token text,
  reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create table if not exists public.sessions (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

create table if not exists public.todos (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  priority text not null default 'medium',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists todos_set_updated_at on public.todos;
create trigger todos_set_updated_at
before update on public.todos
for each row
execute function public.set_updated_at();

create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_created_at_idx on public.todos (created_at);
