import express from 'express';
import { getData } from '../handlers/data.js';

const router = express.Router();

router.get('/:id', getData);

export default router;
