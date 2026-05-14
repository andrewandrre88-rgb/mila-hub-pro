
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "team read documents"
on storage.objects for select to authenticated
using (bucket_id = 'documents' and public.is_team_member(auth.uid()));

create policy "team upload documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and public.is_team_member(auth.uid()));

create policy "team update documents"
on storage.objects for update to authenticated
using (bucket_id = 'documents' and public.is_team_member(auth.uid()));

create policy "team delete documents"
on storage.objects for delete to authenticated
using (bucket_id = 'documents' and public.is_team_member(auth.uid()));
