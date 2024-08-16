import { and, eq, sql } from 'drizzle-orm';

import { db } from '../db/db.js';
import { health_data } from '../db/schema.js';

export async function checkForm(req, res) {
  try {
    const result = await formSubmission(req.params.id);
    if (result.length > 0) {
      res.status(200).json({ submission: true });
    } else {
      res.status(200).json({ submission: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to check form submission' });
  }
}

export async function formSubmission(userId) {
  const result = await db
    .select()
    .from(health_data)
    .where(
      and(
        eq(health_data.submitter_id, userId),
        sql`DATE(${health_data.submission_date}) = CURRENT_DATE`
      )
    );
  return result;
}

export async function submitForm(req, res) {
  try {
    const result = await formSubmission(req.params.id);
    if (result.length > 0) {
      res.status(500).json({ message: 'Form already submitted' });
    } else {
      const form = await db.insert(health_data).values(req.body).returning();
      res.status(201).json({ form });
      console.log(form);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
}
