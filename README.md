## Step Up

Corporate step challenge — web app (Next.js + Supabase). Repo root folder: `step-up` (e.g. `c:\code\step-up`).

1. Copy `.env.example` to `.env.local` and add your [Supabase](https://supabase.com) project URL plus a **public** key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Apply database migrations:
   - **Option A:** Add `DATABASE_URL` (Postgres URI from **Supabase → Database → Connection string**) to `.env.local`, then run `npm run db:migrate`.
   - **Option B:** `npx supabase login`, `npx supabase link --project-ref <your-ref>`, then `npx supabase db push`.
   - **Option C:** Paste each file from `supabase/migrations/` into the Supabase SQL editor (in name order). The optional seed is `20250430000002_seed_pilot_example.sql`.
3. In Supabase **Authentication → URL configuration**, add redirect URLs: `http://localhost:3000/auth/callback` (and your production URL when you deploy).
4. Enable the **Email** provider in Supabase **Authentication → Providers**:
   - Set **"Confirm email"** to your preference (off for frictionless dev, on for production).
   - **Password sign-in is used** — magic link / OTP is not required and can be left disabled.
5. Run the dev server (below), open `/login`, and sign in (or create an account) with email + password.
6. **Sign-up flow:** users create an account directly on `/login` via the "Create account" link in the form. If email confirmation is enabled in Supabase they will receive a confirmation email before they can sign in.
7. **Password reset:** users click "Forgot password?" on the sign-in form; Supabase sends a reset email. After clicking the link they are returned to `/login` with a prompt to sign in using their new password.
8. Assign teams in SQL (until an admin UI exists), for example:  
   `update public.profiles set team_id = '22222222-2222-2222-2222-222222222221' where id = '<user-uuid>';`  
   Use team UUIDs from the optional seed migration or your own `teams` rows.

The npm `package.json` name is `step-up`, matching the repo folder name.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Folder name `step-up`

If your directory is still `Step Up`, rename it to **`step-up`** (matches `package.json` and avoids spaces in paths):

1. Close this project in the editor and any terminal whose current directory is inside it.
2. In PowerShell from `c:\code`:  
   `Rename-Item -LiteralPath "c:\code\Step Up" -NewName "step-up"`  
   (or rename in File Explorer.)
3. Re-open the workspace from `c:\code\step-up`.
