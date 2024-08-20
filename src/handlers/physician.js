import { db } from '../db/db.js';
import { patient_profiles, health_data } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { getUserDetails } from './data.js';

export async function getPatientProfiles(req, res) {
  let allPatientCaregiverProfileData = [];
  console.log('Physician ID:', req.params.id);
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

    console.log('patientProfiles', patientProfiles);

    if (patientProfiles.length > 0) {
      for (let patientProfile of patientProfiles) {
        if (patientProfile) {
          let patientData = await getUserDetails(patientProfile.patient_id);
          let caregiverData = null;

          if (patientProfile.caregiver_id) {
            caregiverData = await getUserDetails(patientProfile.caregiver_id);
          }

          allPatientCaregiverProfileData.push({
            patientProfile,
            patientData: patientData[0],
            caregiverData: caregiverData ? caregiverData[0] : null
          });
        }
      }
      return res.status(200).json(allPatientCaregiverProfileData);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error in getPatientProfiles:', error);
    return res.status(500).json({
      message: 'Failed to get patient profiles',
      error: error.message
    });
  }
}

export async function getHealthData(req, res) {
  const userId = req.params.id;

  try {
    const result = await db
      .select()
      .from(health_data)
      .where(eq(health_data.submitter_id, userId));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getHealthData:', error);
    res
      .status(500)
      .json({ message: 'Failed to get health data', error: error.message });
  }
}
