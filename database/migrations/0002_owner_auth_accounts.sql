-- Owner-controlled account auth for Efficient Labs.
-- Apply on the same private Postgres instance as the billing ledger.

create table if not exists auth_accounts (
  email         text primary key,
  password_hash text not null,
  disabled_at   timestamptz,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function set_auth_accounts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists auth_accounts_set_updated_at on auth_accounts;
create trigger auth_accounts_set_updated_at
before update on auth_accounts
for each row
execute function set_auth_accounts_updated_at();
