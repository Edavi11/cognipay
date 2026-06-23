-- ============================================================
-- CogniPay — Schema Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de feedback de extracciones
create table if not exists public.feedback (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  user_email      text,
  image_url       text,
  raw_text        text,
  extracted_data  jsonb not null,
  incorrect_fields jsonb not null default '[]',
  comment         text,
  created_at      timestamptz not null default now()
);

-- Solo el usuario dueño y admins pueden ver sus registros
alter table public.feedback enable row level security;

create policy "Usuario ve su propio feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

create policy "Usuario inserta su propio feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Storage: bucket para imágenes de feedback
-- ============================================================
-- Ejecuta esto también en el SQL Editor o desde la UI de Storage

insert into storage.buckets (id, name, public)
values ('feedback-images', 'feedback-images', true)
on conflict (id) do nothing;

create policy "Usuarios autenticados pueden subir imagenes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'feedback-images');

create policy "Imagenes publicas de lectura"
  on storage.objects for select
  to public
  using (bucket_id = 'feedback-images');

-- ============================================================
-- CONFIGURACIÓN REQUERIDA EN SUPABASE DASHBOARD
-- ============================================================
-- 1. Authentication > Settings:
--    - Deshabilita "Enable email signups" (solo admin crea usuarios)
--    - Habilita "Enable email confirmations" (opcional pero recomendado)
--
-- 2. Authentication > Users:
--    - Usa "Invite user" para crear cada usuario manualmente
--
-- 3. Project Settings > API:
--    - Copia "Project URL" → NEXT_PUBLIC_SUPABASE_URL
--    - Copia "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
-- ============================================================
