-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add category_id to products
alter table products add column category_id uuid references categories(id);

-- RLS for categories
alter table categories enable row level security;

create policy "Public categories are viewable by everyone"
on categories for select
to authenticated, anon
using (true);

create policy "Authenticated users can insert categories"
on categories for insert
to authenticated
with check (true);
