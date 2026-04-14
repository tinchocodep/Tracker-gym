-- Copiá y pegá esto en Supabase → SQL Editor → Run

create table nutrition_logs (
  date date primary key,
  weight numeric,
  kcal integer,
  protein integer,
  trained boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table workouts (
  id text primary key,
  date date not null,
  session_key text not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Permitir acceso sin autenticación (app de uso personal)
alter table nutrition_logs enable row level security;
alter table workouts enable row level security;

create policy "allow all nutrition" on nutrition_logs for all using (true) with check (true);
create policy "allow all workouts" on workouts for all using (true) with check (true);
