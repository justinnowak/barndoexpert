import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const builderId = session.metadata?.builderId;
        if (builderId) {
          await sql`
            UPDATE builders SET
              stripe_subscription_id = ${session.subscription as string},
              subscription_status = 'active',
              status = 'pending_approval',
              updated_at = NOW()
            WHERE id = ${builderId}
          `;
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const suspended = ['past_due', 'canceled', 'unpaid'].includes(sub.status);
        if (suspended) {
          await sql`UPDATE builders SET subscription_status = ${sub.status}, status = 'suspended', updated_at = NOW() WHERE stripe_subscription_id = ${sub.id}`;
        } else {
          await sql`UPDATE builders SET subscription_status = ${sub.status}, updated_at = NOW() WHERE stripe_subscription_id = ${sub.id}`;
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await sql`
          UPDATE builders SET subscription_status = 'canceled', status = 'suspended', updated_at = NOW()
          WHERE stripe_subscription_id = ${sub.id}
        `;
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await sql`
          UPDATE builders SET subscription_status = 'past_due', updated_at = NOW()
          WHERE stripe_customer_id = ${invoice.customer as string}
        `;
        break;
      }
    }
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
