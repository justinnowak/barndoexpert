import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminDb = getFirestore(process.env.FIRESTORE_DATABASE_ID || '(default)');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'justin@completebarndo.com';

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

    // Check admin privileges
    if (decodedToken.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { builderId, action } = req.body;

    if (!builderId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Missing builderId or invalid action (approve/reject)' });
    }

    const builderRef = adminDb.collection('builders').doc(builderId);
    const builderDoc = await builderRef.get();

    if (!builderDoc.exists) {
      return res.status(404).json({ error: 'Builder not found' });
    }

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    await builderRef.update({
      status: newStatus,
      isVerified: action === 'approve',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      builderId,
      status: newStatus,
      message: `Builder ${action === 'approve' ? 'approved and now live' : 'rejected'}`,
    });
  } catch (error: any) {
    console.error('Admin approve error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
