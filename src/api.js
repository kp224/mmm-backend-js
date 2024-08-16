import express from 'express';
import webhooksRouter from './routes/webhooks.js';
import roleRouter from './routes/role.js';
import userRouter from './routes/user.js';
import formRouter from './routes/form.js';
import onboardingRouter from './routes/onboarding.js';

const router = express.Router();

// Mount the sub-routers
router.use('/webhooks', webhooksRouter);
router.use('/role', roleRouter);
router.use('/user', userRouter);
router.use('/form', formRouter);
router.use('/onboarding', onboardingRouter);

export default router;
