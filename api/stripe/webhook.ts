import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const adminDb = getFirestore(process.env.FIRESTORE_DATABASE_ID || '(default)');

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function findBuilderByField(field: string, value: string) {
  const snapshot = await adminDb.collection('builders').where(field, '==', value).limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, data: snapshot.docs[0].data() };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const builderId = session.metadata?.builderId;

        if (builderId) {
          const builderRef = adminDb.collection('builders').doc(builderId);
          await builderRef.update({
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: 'active',
            status: 'pending_approval',
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`Builder ${builderId} checkout completed — pending approval`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const builder = await findBuilderByField('stripeSubscriptionId', subscription.id);

        if (builder) {
          const builderRef = adminDb.collection('builders').doc(builder.id);
          const updates: Record<string, any> = {
            subscriptionStatus: subscription.status,
            updatedAt: FieldValue.serverTimestamp(),
          };

          // Suspend listing if subscription is no longer active
          if (['past_due', 'canceled', 'unpaid'].includes(subscription.status)) {
            updates.status = 'suspended';
          }

          await builderRef.update(updates);
          console.log(`Builder ${builder.id} subscription updated to ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const builder = await findBuilderByField('stripeSubscriptionId', subscription.id);

        if (builder) {
          const builderRef = adminDb.collection('builders').doc(builder.id);
          await builderRef.update({
            subscriptionStatus: 'canceled',
            status: 'suspended',
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`Builder ${builder.id} subscription canceled — suspended`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const builder = await findBuilderByField('stripeCustomerId', customerId);

        if (builder) {
          const builderRef = adminDb.collection('builders').doc(builder.id);
          await builderRef.update({
            subscriptionStatus: 'past_due',
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`Builder ${builder.id} payment failed — past due`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
