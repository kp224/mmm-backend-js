import express from 'express';
import { submitForm, checkForm } from '../handlers/form.js';

const router = express.Router();

router.post('/submit/:id', submitForm);
router.get('/check/:id', checkForm);

export default router;
