create table if not exists public.password_resets (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  user_id uuid references auth.users(id) not null,
  token text not null unique,
  expires_at timestamp with time zone not null,
  used boolean default false,
  created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.password_resets enable row level security;

-- Allow anyone to insert a password reset request
create policy "Anyone can insert password reset requests"
  on public.password_resets for insert
  with check (true);

-- Allow anyone to select password reset requests
create policy "Anyone can select password reset requests"
  on public.password_resets for select
  using (true);

-- Allow anyone to update password reset requests
create policy "Anyone can update password reset requests"
  on public.password_resets for update
  using (true);

-- Allow anyone to delete password reset requests
create policy "Anyone can delete password reset requests"
  on public.password_resets for delete
  using (true);

-- Create indexes for better performance
create index if not exists password_resets_token_idx on public.password_resets(token);
create index if not exists password_resets_user_id_idx on public.password_resets(user_id);
create index if not exists password_resets_email_idx on public.password_resets(email); 