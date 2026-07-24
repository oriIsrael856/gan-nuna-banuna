-- Dedicated allergies / medical-sensitivities field on children.
-- Previously this information was mixed into the free-text notes field.
alter table public.children
  add column if not exists allergies text;
