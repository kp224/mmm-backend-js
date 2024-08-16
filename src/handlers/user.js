import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';
import { db } from '../db/db.js';

export async function getUserData(req, res) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.params.id));
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: 'error' });
  }
}
