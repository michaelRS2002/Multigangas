-- Add is_out_of_stock column to products
alter table products add column is_out_of_stock boolean default false;
