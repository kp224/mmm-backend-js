import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db/db.js';
import { users, patient_profiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function submitOnboarding(req, res) {
  try {
    const { userId, role, connectionId } = req.body;

    if (!(userId && role)) {
      throw new Error('Invalid request body');
    }

    // Save the user's role to Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        role: role
      }
    });

    console.log(userId, role);

    const updateResult = await db
      .update(users)
      .set({ role: role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firstName: users.first_name,
        lastName: users.last_name
      });

    console.log('Update result:', updateResult);

    let updateUser;
    if (updateResult && updateResult.length > 0) {
      updateUser = updateResult[0];
      console.log('Updated user:', updateUser);
    } else {
      console.log('No user was updated');
    }

    console.log(updateUser.id, updateUser.firstName, updateUser.lastName);

    if (connectionId && updateUser.id) {
      if (role === 'patient') {
        console.log('onboarding patient');
        const user_name = updateUser.firstName + ' ' + updateUser.lastName;

        await db.insert(patient_profiles).values({
          name: user_name,
          patient_id: userId,
          physician_id: connectionId
        });
      } else if (role === 'caregiver') {
        console.log('onboarding caregiver');

        const caregiverProfile = await db
          .update(patient_profiles)
          .set({ caregiver_id: updateUser.id })
          .where(eq(patient_profiles.patient_id, connectionId));

        console.log(caregiverProfile);
      } else {
        console.error('Invalid role');
      }
    }

    res.status(200).json({ message: 'Successfully submitted onboarding' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit onboarding' });
  }
}
