import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db/db.js';
import { users, patient_profiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function submitOnboarding(req, res) {
  try {
    const { userId, role, connectionId } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    // Save the user's role to Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        role: role
      }
    });

    console.log('Clerk user updated:', userId, role);

    // Update the user's role in the database
    const updateResult = await db
      .update(users)
      .set({ role: role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firstName: users.first_name,
        lastName: users.last_name
      });

    if (!updateResult || updateResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateUser = updateResult[0];
    console.log('Updated user:', updateUser);

    // Ensure updateUser is valid
    if (!updateUser || !updateUser.id) {
      return res
        .status(500)
        .json({ message: 'Failed to retrieve updated user information' });
    }

    // Role-specific logic
    if (role === 'patient' && connectionId) {
      console.log('Onboarding patient');

      const user_name = `${updateUser.firstName} ${updateUser.lastName}`;

      await db.insert(patient_profiles).values({
        name: user_name,
        patient_id: userId,
        physician_id: connectionId
      });

      console.log('Patient profile created');
    } else if (role === 'caregiver' && connectionId) {
      console.log('Onboarding caregiver');

      const caregiverProfile = await db
        .update(patient_profiles)
        .set({ caregiver_id: updateUser.id })
        .where(eq(patient_profiles.patient_id, connectionId))
        .returning('*');

      console.log('Caregiver profile updated:', caregiverProfile);
    } else if (role !== 'physician') {
      return res
        .status(400)
        .json({ message: 'Invalid role or missing connectionId' });
    }

    res.status(200).json({ message: 'Successfully submitted onboarding' });
  } catch (error) {
    console.error('Error submitting onboarding:', error);
    res.status(500).json({ message: 'Failed to submit onboarding' });
  }
}
