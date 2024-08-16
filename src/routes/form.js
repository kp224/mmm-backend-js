import express from 'express';

const router = express.Router();

// Example route for /api/form
router.get('/', (req, res) => {
  res.send('Form endpoint');
});

export default router;
