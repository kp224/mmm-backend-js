import express from 'express';
import { getPatientProfiles } from '../handlers/physician.js';

const router = express.Router();

router.get('/getPatientProfiles/:id', getPatientProfiles);

export default router;
