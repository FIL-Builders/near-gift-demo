This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Database Setup (Supabase)

This app stores gift links and WebAuthn credentials in Supabase. To create the required tables:

- Ensure you have a Supabase project and have configured `.env` with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

Then run this helper to print the SQL you need to execute in the Supabase Dashboard:

```
yarn db:setup:js
```

Follow the printed instructions:

1) Open your Supabase project dashboard
2) Go to SQL Editor
3) Copy-paste the output between `--- scripts/setup-db.sql ---` and `--- end ---`
4) Run the query and verify the tables exist:
   - `public.gifts`
   - `public.webauthn_credentials`

If you ever need to reprint the SQL, re-run `yarn db:setup:js`. The source file lives at `scripts/setup-db.sql`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
