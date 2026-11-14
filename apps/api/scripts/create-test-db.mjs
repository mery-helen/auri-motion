// Creates the dedicated test database (TEST_DATABASE_URL) if it does not exist.
// Usage: node scripts/create-test-db.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));
loadEnv({ path: path.join(apiRoot, '.env') });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  console.error('TEST_DATABASE_URL is required (see .env.example).');
  process.exit(1);
}

const target = new URL(testDatabaseUrl);
const databaseName = target.pathname.replace(/^\//, '');

if (!databaseName) {
  console.error('TEST_DATABASE_URL must include a database name.');
  process.exit(1);
}

const adminUrl = new URL(testDatabaseUrl);
adminUrl.pathname = '/postgres';

const client = new Client({ connectionString: adminUrl.toString() });
await client.connect();

try {
  const existing = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [databaseName],
  );

  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    console.log(`Created test database "${databaseName}".`);
  } else {
    console.log(`Test database "${databaseName}" already exists.`);
  }
} finally {
  await client.end();
}
