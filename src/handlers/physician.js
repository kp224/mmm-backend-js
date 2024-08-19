import { db } from '../db/db.js';
import { health_data } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { getUserDetails } from './data.js';

export async function getPatientProfiles(req, res) {
  let allPatientCaregiverProfileData = [];
  console.log(req.params.id);
  try {
    const patientProfiles = await db
      .select({
        id: patient_profiles.id,
        name: patient_profiles.name,
        patient_id: patient_profiles.patient_id,
        caregiver_id: patient_profiles.caregiver_id,
        createdAt: patient_profiles.createdAt
      })
      .from(patient_profiles)
      .where(eq(patient_profiles.physician_id, req.params.id));

    console.log(patientProfiles);

    // loop through patientProfiles and use the patient_id to get the patient's name and email
    // loop through the patientProfiles and use the caregiver_id to get the caregiver's name and email if it exists

    if (patientProfiles.length > 0) {
      for (let index in patientProfiles) {
        let patientProfile = patientProfiles[index];

        if (patientProfile) {
          let patientData = await getUserDetails(patientProfile.patient_id);
          let caregiverData = null;

          if (patientProfile.caregiver_id) {
            caregiverData = await getUserDetails(patientProfile.caregiver_id);
          }

          allPatientCaregiverProfileData.push({
            patientProfile,
            patientData,
            caregiverData
          });
        }
      }
      return res.status(200).json(allPatientCaregiverProfileData);
    } else if (patientProfiles.length === 0) {
      res.status(200).json(patientProfiles);
    } else {
      res.status(500).json({
        message: 'An error occurred while retrieving patient profiles'
      });
    }

    // res.status(200).json(patientProfiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get patient profiles' });
  }
}

export async function getHealthData(req, res) {
  const userId = req.params.id;

  const result = await db
    .select()
    .from(health_data)
    .where(eq(health_data.submitter_id, userId));

  if (result.length === 0) {
    res.status(200).json([]);
  } else if (result.length > 0) {
    res.status(200).json(result);
  }
}
