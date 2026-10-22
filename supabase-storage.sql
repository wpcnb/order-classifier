-- 后勤订单图片：Supabase SQL Editor 执行一次。
-- 切勿使用 public bucket。所有访问均通过登录账号及 RLS 控制。
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('logistics-receipts', 'logistics-receipts', false, 12582912, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public=false,
      file_size_limit=excluded.file_size_limit,
      allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "logistics_cloud_user_read_v1" on storage.objects;
drop policy if exists "logistics_cloud_user_upload_v1" on storage.objects;
drop policy if exists "logistics_cloud_user_delete_v1" on storage.objects;

create policy "logistics_cloud_user_read_v1"
on storage.objects for select to authenticated
using (bucket_id='logistics-receipts'
  and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "logistics_cloud_user_upload_v1"
on storage.objects for insert to authenticated
with check (bucket_id='logistics-receipts'
  and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "logistics_cloud_user_delete_v1"
on storage.objects for delete to authenticated
using (bucket_id='logistics-receipts'
  and (storage.foldername(name))[1] = (select auth.uid()::text));

-- 授权同一邮箱登录，即可在手机、电脑等设备看到同一账号下的图片。
-- 不用把图片或 secret/service_role key 提交到公开 GitHub 仓库。
