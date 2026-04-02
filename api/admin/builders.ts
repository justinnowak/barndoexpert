import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { verifyToken, createClerkClient } from '@clerk/backend';
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'justin@completebarndo.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split('Bearer ')[1];

  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    const clerkUser = await clerk.users.getUser(payload.sub);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Admin access required' });

    const { status } = req.query;
    const { rows } = status
      ? await sql`SELECT * FROM builders WHERE status = ${status as string} ORDER BY created_at DESC`
      : await sql`SELECT * FROM builders ORDER BY created_at DESC`;

    return res.status(200).json(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      location: r.location,
      phone: r.phone,
      website: r.website,
      description: r.description,
      plan: r.plan,
      status: r.status,
      isVerified: r.is_verified,
      createdAt: r.created_at,
    })));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
