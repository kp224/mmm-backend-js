import { eq, isNull } from 'drizzle-orm';
import { patient_profiles, users } from '../db/schema.js';
import { db } from '../db/db.js';

export async function getUserByRole(req, res) {
  try {
    const role = req.params.role;

    if (role === 'patient') {
      const result = await db
        .select({
          id: patient_profiles.patient_id,
          name: patient_profiles.name
        })
        .from(patient_profiles)
        .where(isNull(patient_profiles.caregiver_id));
      res.status(200).json({ result });
    } else if (role === 'physician') {
      const result = await db
        .select({
          id: users.id,
          first_name: users.first_name,
          last_name: users.last_name
        })
        .from(users)
        .where(eq(users.role, 'physician'));
      res.status(200).json({ result });
    } else {
      res.status(400).json({ message: 'Role does not exist' });
    }
  } catch (error) {
    res.status(400).json({ message: 'error' });
  }
}
