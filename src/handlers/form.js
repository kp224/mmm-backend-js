import { and, eq, sql } from 'drizzle-orm';

import { db } from '../db/db.js';
import { health_data, patient_profiles } from '../db/schema.js';

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
      console.log(req.body);
      console.log('role', req.body.role);
      // const form = await db.insert(health_data).values(req.body).returning();
      let patient_profile_id;

      if (req.body.role === 'patient') {
        const patient = await db
          .select()
          .from(patient_profiles)
          .where(eq(patient_profiles.patient_id, req.params.id));

        console.log(patient[0]?.id);

        patient_profile_id = patient[0]?.id;

        if (patient.length === 0) {
          res.status(500).json({ message: 'Patient not found' });
        }
      } else if (req.body.role === 'caregiver') {
        const caregiver = await db
          .select()
          .from(patient_profiles)
          .where(eq(patient_profiles.caregiver_id, req.params.id));

        console.log(caregiver[0]?.id);

        patient_profile_id = caregiver[0]?.id;

        if (caregiver.length === 0) {
          res.status(500).json({ message: 'Caregiver not found' });
        }
      }

      const score =
        req.body.values.health +
        req.body.values.energy +
        req.body.values.mood +
        req.body.values.living_situation +
        req.body.values.memory +
        req.body.values.family +
        req.body.values.marriage +
        req.body.values.friends +
        req.body.values.self_whole +
        req.body.values.chores_ability +
        req.body.values.fun_ability +
        req.body.values.money +
        req.body.values.life_whole;

      const form = await db.insert(health_data).values({
        submitter_role: req.body.role,
        submitter_id: req.params.id,
        patient_profile_id: patient_profile_id,
        health: req.body.values.health,
        energy: req.body.values.energy,
        mood: req.body.values.mood,
        living_situation: req.body.values.living_situation,
        memory: req.body.values.memory,
        family: req.body.values.family,
        marriage: req.body.values.marriage,
        friends: req.body.values.friends,
        self_whole: req.body.values.self_whole,
        chores_ability: req.body.values.chores_ability,
        fun_ability: req.body.values.fun_ability,
        money: req.body.values.money,
        life_whole: req.body.values.life_whole,
        score: score
      });

      res.status(201).json({ form });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
}
