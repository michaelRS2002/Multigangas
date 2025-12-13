-- Drop existing tables if they exist (be careful, this deletes data)
drop table if exists product_images;
drop table if exists products;

-- Create the products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the product_images table
create table product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  watermarked_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;
alter table product_images enable row level security;

-- Policies for products
create policy "Public products are viewable by everyone"
on products for select
to authenticated, anon
using (true);

create policy "Authenticated users can modify products"
on products for all
to authenticated
using (true)
with check (true);

-- Policies for product_images
create policy "Public product images are viewable by everyone"
on product_images for select
to authenticated, anon
using (true);

create policy "Authenticated users can modify product images"
on product_images for all
to authenticated
using (true)
with check (true);
