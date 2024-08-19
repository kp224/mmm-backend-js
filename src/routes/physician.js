import express from 'express';
import { getHealthData, getPatientProfiles } from '../handlers/physician.js';

const router = express.Router();

router.get('/getPatientProfiles/:id', getPatientProfiles);
router.get('/getHealthData/:id', getHealthData);

export default router;
