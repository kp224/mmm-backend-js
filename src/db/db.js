import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(
  'postgresql://mmm_owner:Z6MPfIp9hzuE@ep-purple-moon-a6ptpovb.us-west-2.aws.neon.tech/mmm?sslmode=require'
);
export const db = drizzle(sql);
