import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));
loadEnv({ path: path.join(apiRoot, '.env') });

describe('User model (e2e)', () => {
  let client: Client;

  beforeAll(async () => {
    const databaseUrl = process.env.TEST_DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'TEST_DATABASE_URL is required to run the User model e2e test.',
      );
    }

    execSync('npx prisma migrate deploy', {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    });

    client = new Client({ connectionString: databaseUrl });
    await client.connect();
  }, 60_000);

  afterAll(async () => {
    await client?.end();
  });

  it('creates the "User" table', async () => {
    const result = await client.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'`,
    );

    expect(result.rowCount).toBe(1);
  });

  it('enforces a unique constraint on "email"', async () => {
    const result = await client.query(
      `SELECT i.relname AS index_name
         FROM pg_class t
         JOIN pg_index ix ON ix.indrelid = t.oid
         JOIN pg_class i ON i.oid = ix.indexrelid
         JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (ix.indkey)
        WHERE t.relname = 'User'
          AND ix.indisunique = true
          AND a.attname = 'email'`,
    );

    expect(result.rowCount).toBeGreaterThanOrEqual(1);
  });
});
