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

    // Find builder doc for this user
    const snapshot = await adminDb.collection('builders')
      .where('ownerUid', '==', uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No builder listing found' });
    }

    const builderData = snapshot.docs[0].data();
    const stripeCustomerId = builderData.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found for this builder' });
    }

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://barndoexpert.com';

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
