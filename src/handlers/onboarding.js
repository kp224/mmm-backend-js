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
      .execute();

    // Fetch the updated user separately
    const updatedUser = await db
      .select({
        id: users.id,
        firstName: users.first_name,
        lastName: users.last_name
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((results) => results[0]);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user:', updatedUser);

    // Role-specific logic
    if (role === 'patient' && connectionId) {
      console.log('Onboarding patient');

      const user_name = `${updatedUser.firstName} ${updatedUser.lastName}`;

      await db
        .insert(patient_profiles)
        .values({
          name: user_name,
          patient_id: userId,
          physician_id: connectionId
        })
        .execute();

      console.log('Patient profile created');
    } else if (role === 'caregiver' && connectionId) {
      console.log('Onboarding caregiver');

      await db
        .update(patient_profiles)
        .set({ caregiver_id: updatedUser.id })
        .where(eq(patient_profiles.patient_id, connectionId))
        .execute();

      console.log('Caregiver profile updated');
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
