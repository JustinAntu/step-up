/**
 * Applies all `supabase/migrations/*.sql` in sorted order using Postgres.
 * Requires DATABASE_URL (or DIRECT_URL) — Supabase Dashboard → Database → Connection string → URI.
 * Run: npm run db:migrate
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const migDir = path.join(root, "supabase", "migrations");

const url =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL;

if (!url) {
  console.error(
    "Missing DATABASE_URL (or DIRECT_URL / POSTGRES_URL).\n" +
      "Add the Postgres URI from Supabase → Database → Connection string (use Session or Direct).\n" +
      "Alternatively: npx supabase login && npx supabase link --project-ref <ref> && npx supabase db push",
  );
  process.exit(1);
}

const files = (await fs.readdir(migDir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});

await client.connect();
try {
  for (const file of files) {
    const full = path.join(migDir, file);
    const sql = await fs.readFile(full, "utf8");
    console.log(`→ ${file}`);
    await client.query(sql);
  }
  console.log("Migrations finished.");
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.end();
}
