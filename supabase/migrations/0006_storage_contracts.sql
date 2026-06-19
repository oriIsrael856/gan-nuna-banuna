-- Storage RLS for private contracts bucket (upload + signed URL read).
-- Depends on 0001 (contracts bucket) and helper functions current_user_role / current_daycare_id.

-- Teachers/admins upload PDFs under their daycare folder: {daycare_id}/{child_id}/...
create policy "teachers upload contracts"
on storage.objects for insert
with check (
  bucket_id = 'contracts'
  and public.current_user_role() in ('teacher', 'admin')
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);

-- Teachers/admins can read objects in their daycare folder (signed URL generation).
create policy "teachers read contracts"
on storage.objects for select
using (
  bucket_id = 'contracts'
  and public.current_user_role() in ('teacher', 'admin')
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);

-- Parents read contract files for their linked children only.
create policy "parents read linked contracts"
on storage.objects for select
using (
  bucket_id = 'contracts'
  and public.current_user_role() = 'parent'
  and (storage.foldername(name))[2]::uuid in (select public.parent_child_ids())
);

-- Teachers can delete/replace contract files in their daycare folder.
create policy "teachers delete contracts"
on storage.objects for delete
using (
  bucket_id = 'contracts'
  and public.current_user_role() in ('teacher', 'admin')
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);
