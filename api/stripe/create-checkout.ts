import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const adminDb = getFirestore(process.env.FIRESTORE_DATABASE_ID || '(default)');

const PRICE_MAP: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { plan, builderId, email } = req.body;

    if (!plan || !builderId || !email) {
      return res.status(400).json({ error: 'Missing required fields: plan, builderId, email' });
    }

    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return res.status(400).json({ error: `Invalid plan: ${plan}` });
    }

    // Verify builder doc exists and belongs to this user
    const builderRef = adminDb.collection('builders').doc(builderId);
    const builderDoc = await builderRef.get();

    if (!builderDoc.exists) {
      return res.status(404).json({ error: 'Builder not found' });
    }

    const builderData = builderDoc.data();
    if (builderData?.ownerUid !== uid) {
      return res.status(403).json({ error: 'Not authorized to manage this builder listing' });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = builderData?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          firebaseUid: uid,
          builderId,
        },
      });
      stripeCustomerId = customer.id;

      // Save Stripe customer ID to builder doc
      await builderRef.update({ stripeCustomerId });
    }

    // Create Checkout Session
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://barndoexpert.com';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}?tab=dashboard&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?tab=signup&checkout=canceled`,
      metadata: {
        builderId,
        firebaseUid: uid,
        plan,
      },
      subscription_data: {
        metadata: {
          builderId,
          firebaseUid: uid,
          plan,
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
