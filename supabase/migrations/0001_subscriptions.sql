-- Subscriptions / plan state, written by the Stripe webhook (service role) and
-- read by the signed-in user for their own row. Run this in your Supabase
-- project (SQL editor or `supabase db push`) before going live.

create table if not exists public.subscriptions (
  email              text primary key,
  plan               text not null default 'free',
  status             text,
  stripe_customer_id text,
  updated_at         timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- A signed-in user may read only the row matching their own email. There is no
-- insert/update/delete policy: all writes come from the webhook via the
-- service-role key, which bypasses RLS.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription"
  on public.subscriptions
  for select
  using ((auth.jwt() ->> 'email') = email);
