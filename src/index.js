import express from 'express';
import { config } from 'dotenv';
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

// Use the /api router
app.use('/api', apiRouter);

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`API available on http://localhost:${port}`);
});
