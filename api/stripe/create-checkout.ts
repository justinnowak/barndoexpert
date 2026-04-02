import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

const PRICE_MAP: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split('Bearer ')[1];
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    const userId = payload.sub;

    const { plan, builderId, email } = req.body;
    if (!plan || !builderId || !email) return res.status(400).json({ error: 'Missing required fields' });

    const priceId = PRICE_MAP[plan];
    if (!priceId) return res.status(400).json({ error: `Invalid plan: ${plan}` });

    const { rows } = await sql`SELECT owner_id, stripe_customer_id FROM builders WHERE id = ${builderId} LIMIT 1`;
    if (rows.length === 0) return res.status(404).json({ error: 'Builder not found' });
    if (rows[0].owner_id !== userId) return res.status(403).json({ error: 'Not authorized' });

    let stripeCustomerId = rows[0].stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email, metadata: { clerkUserId: userId, builderId } });
      stripeCustomerId = customer.id;
      await sql`UPDATE builders SET stripe_customer_id = ${stripeCustomerId} WHERE id = ${builderId}`;
    }

    const origin = req.headers.origin || 'https://barndoexpert.vercel.app';
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}?tab=dashboard&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?tab=signup&checkout=canceled`,
      metadata: { builderId, clerkUserId: userId, plan },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
