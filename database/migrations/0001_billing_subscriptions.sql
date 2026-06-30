-- Efficient Labs self-hosted billing ledger.
-- Apply on the owner-controlled Postgres instance referenced by DATABASE_URL.
-- The app server is the only trusted reader/writer; do not expose this table
-- directly to browsers.

create table if not exists subscriptions (
  email                  text primary key,
  plan                   text not null default 'free'
                         check (plan in ('free', 'exos_pro', 'apex', 'teams')),
  status                 text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists subscriptions_stripe_subscription_id_idx
  on subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create or replace function set_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_set_updated_at on subscriptions;
create trigger subscriptions_set_updated_at
before update on subscriptions
for each row
execute function set_subscriptions_updated_at();
