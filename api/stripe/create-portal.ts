import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split('Bearer ')[1];
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    const userId = payload.sub;

    const { rows } = await sql`SELECT stripe_customer_id FROM builders WHERE owner_id = ${userId} LIMIT 1`;
    if (rows.length === 0) return res.status(404).json({ error: 'No builder listing found' });

    const stripeCustomerId = rows[0].stripe_customer_id;
    if (!stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer found for this builder' });

    const origin = req.headers.origin || 'https://barndoexpert.vercel.app';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}?tab=dashboard`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
