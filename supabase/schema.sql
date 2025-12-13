-- Create the products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  watermarked_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create a policy that allows anyone to read products
create policy "Public products are viewable by everyone"
on products for select
to authenticated, anon
using (true);

-- Create a policy that allows authenticated users to insert/update/delete products
-- Note: You should set up authentication in Supabase and restrict this to admins
create policy "Authenticated users can modify products"
on products for all
to authenticated
using (true)
with check (true);

-- Storage bucket setup (You need to create a bucket named 'products' in Supabase dashboard)
-- Policy for public read access to the 'products' bucket
-- create policy "Public Access"
-- on storage.objects for select
-- using ( bucket_id = 'products' );

-- Policy for authenticated upload access to the 'products' bucket
-- create policy "Authenticated Upload"
-- on storage.objects for insert
-- to authenticated
-- with check ( bucket_id = 'products' );
