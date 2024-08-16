import express from 'express';
import { getUserData } from '../handlers/user.js';

const router = express.Router();

router.get('/:id', getUserData);

export default router;
