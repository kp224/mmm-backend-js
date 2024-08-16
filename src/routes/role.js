import express from 'express';
import { getUserByRole } from '../handlers/role.js';

const router = express.Router();

router.get('/:role', getUserByRole);

export default router;
