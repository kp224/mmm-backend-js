import express from 'express';

const router = express.Router();

// Example route for /api/role
router.get('/', (req, res) => {
  res.send('Role endpoint');
});

export default router;
