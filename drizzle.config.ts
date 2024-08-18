import type { Config } from 'drizzle-kit';
/** @type { import("drizzle-kit").Config } */
export default {
  dialect: 'postgresql', // "mysql" | "sqlite" | "postgresql"
  schema: './src/db/schema.js',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
};
