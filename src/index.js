import express from 'express';
import { config } from 'dotenv';
import apiRouter from './api.js';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();

app.use('/api', apiRouter);

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`API available on http://localhost:${port}`);
});
