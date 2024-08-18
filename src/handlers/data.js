import { eq } from 'drizzle-orm';
import { users, patient_profiles } from '../db/schema.js';
import { db } from '../db/db.js';

export async function getData(req, res) {
  try {
    const id = req.params.id;

    const findUser = await db
      .select({
        role: users.role
      })
      .from(users)
      .where(eq(users.id, id));

    const role = findUser[0].role;

    if (role === 'patient') {
      const patient_profile = await db
        .select({
          caregiver_id: patient_profiles.caregiver_id,
          physician_id: patient_profiles.physician_id
        })
        .from(patient_profiles)
        .where(eq(patient_profiles.patient_id, id));

      const physicianId = patient_profile[0].physician_id;
      const caregiverId = patient_profile[0].caregiver_id;

      let caregiverData = null;
      let physicianData = null;

      if (caregiverId) {
        caregiverData = await getUserDetails(caregiverId);
      }

      if (physicianId) {
        physicianData = await getUserDetails(physicianId);
      }

      res.status(200).json({
        user: findUser[0],
        patientProfile: patient_profile[0],
        caregiver: caregiverData ? caregiverData[0] : null,
        physician: physicianData ? physicianData[0] : null
      });

      return;
    } else if (role === 'caregiver') {
      const patient_profile = await db
        .select({
          patient_id: patient_profiles.patient_id,
          physician_id: patient_profiles.physician_id
        })
        .from(patient_profiles)
        .where(eq(patient_profiles.caregiver_id, id));

      const patientId = patient_profile[0].patient_id;
      const physicianId = patient_profile[0].physician_id;

      let patientData = null;
      let physicianData = null;

      if (patientId) {
        patientData = await getUserDetails(patientId);
      }

      if (physicianId) {
        physicianData = await getUserDetails(physicianId);
      }

      res.status(200).json({
        user: findUser[0],
        patientProfile: patient_profile[0],
        patient: patientData ? patientData[0] : null,
        physician: physicianData ? physicianData[0] : null
      });

      return; // Add this return to prevent further execution
    } else {
      res.status(200).json({ findUser });
    }
  } catch (error) {
    res.status(400).json({ message: 'error' });
  }
}

async function getUserDetails(userId) {
  const user = await db
    .select({
      first_name: users.first_name,
      last_name: users.last_name,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId));
  return user;
}
