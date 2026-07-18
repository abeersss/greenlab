# GreenLab login and visitor records

GreenLab can offer fast, passwordless login through **Google** and **email magic links**. Logged-in users can then be recorded as visitors. Do not attempt to identify people who have not signed in.

## 1. Create Supabase

1. Create a free Supabase project.
2. In **Authentication > URL Configuration**, set the Site URL to your final Cloudflare Pages URL, for example `https://greenlab-dr-abeer.pages.dev`.
3. Add the same URL under Redirect URLs.
4. Copy the project URL and the **publishable** key into `auth-config.js`. Never use a `service_role` key in the website.

## 2. Enable email magic links

In **Authentication > Providers > Email**, enable email sign-in. Users enter an email address and receive a one-time sign-in link. For a small pilot this is the quickest option. Configure a custom SMTP service before broad public use because the default delivery service is rate-limited.

## 3. Enable Google login

1. In Google Cloud, create a Web OAuth client for GreenLab.
2. Add your Pages URL as an Authorized JavaScript origin.
3. In Supabase, enable the Google provider and add the Google client ID and client secret.
4. Copy the callback URL shown by Supabase into Google Cloud's Authorized redirect URIs.

## 4. Create the visitor table

Run this in the Supabase SQL editor:

```sql
create table public.learner_visits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  visited_at timestamptz not null default now()
);

alter table public.learner_visits enable row level security;

create policy "Users record their own visit"
on public.learner_visits for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users see only their own visits"
on public.learner_visits for select
to authenticated
using ((select auth.uid()) = user_id);
```

Dr. Abeer can see authenticated users in the Supabase Authentication dashboard. For an administrator-only overview of visitor records, create a server-side admin dashboard later; do not expose other learners' data in the browser.

## Privacy

Show a short privacy notice before launch: GreenLab stores a signed-in learner's email through the authentication provider and a visit time for platform improvement. Publish a privacy policy that reflects the final data practices and applicable laws.
