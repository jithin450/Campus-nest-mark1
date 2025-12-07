create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('hostel','restaurant','place','community')),
  location text not null,
  image_url text,
  meta jsonb,
  created_at timestamp with time zone default now()
);

insert into public.cards (title, description, category, location, image_url, meta)
values
('Student Hostel A', 'Comfortable rooms near campus', 'hostel', 'Bengaluru', 'https://images.unsplash.com/photo-1560448204-00f46f4e62c9?w=800', '{"available_rooms":12}'),
('Food Court Central', 'Multi-cuisine dining space', 'restaurant', 'Bengaluru', 'https://images.unsplash.com/photo-1555992336-03a23c8bf9a0?w=800', '{"cuisine":"multi"}'),
('Tech Park Lake', 'Relaxing spot with walking trail', 'place', 'Bengaluru', 'https://images.unsplash.com/photo-1501117716987-c8e5040c03f5?w=800', '{}'),
('BLR Student WhatsApp', 'Join the Bengaluru student community', 'community', 'Bengaluru', null, '{"platform":"whatsapp","members":200,"link":"https://wa.me/group/example-blr"}');

