import express from 'express';

const router = express.Router();

// Example route for /api/user
router.get('/', (req, res) => {
  res.send('User endpoint');
});

export default router;
