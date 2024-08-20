import express from 'express';
import { config } from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import apiRouter from './api.js';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();

// Use JSON parsing for all routes except webhooks
app.use((req, res, next) => {
  if (req.path === '/api/webhooks') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Apply Clerk authentication to all /api routes except /api/webhooks
app.use('/api', (req, res, next) => {
  if (req.path === '/webhooks') {
    next();
  } else {
    ClerkExpressRequireAuth()(req, res, next);
  }
});

// Use the /api router
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`API available on http://localhost:${port}`);
});
