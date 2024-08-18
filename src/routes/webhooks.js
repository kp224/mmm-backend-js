import express from 'express';
import { Webhook } from 'svix';
import bodyParser from 'body-parser';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';

const router = express.Router();

// Use raw body parsing for the webhook route
router.post(
  '/',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error('You need a WEBHOOK_SECRET in your .env');
    }

    const headers = req.headers;
    const payload = req.body;

    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res
        .status(400)
        .json({ success: false, message: 'No Svix headers' });
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature
      });
    } catch (err) {
      console.log('Error verifying webhook:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    const { id, first_name, last_name, email_addresses } = evt.data;
    const email = email_addresses[0].email_address;
    console.log(id, first_name, last_name, email);
    const eventType = evt.type;

    if (evt.type === 'user.created') {
      console.log('userId:', evt.data.id);
      await db
        .insert(users)
        .values({
          id: id,
          first_name: first_name,
          last_name: last_name,
          email: email
        })
        .returning();
    }

    if (evt.type === 'user.updated') {
      console.log('userId:', evt.data.id);
      await db.update(users).set({
        first_name: first_name,
        last_name: last_name,
        email: email
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  }
);

export default router;
