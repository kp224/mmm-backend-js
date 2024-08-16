import express from 'express';
import { submitOnboarding } from '../handlers/onboarding.js';

const router = express.Router();

router.post('/', submitOnboarding);

export default router;
