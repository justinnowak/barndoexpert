import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@clerk/backend';

async function getClerkUserId(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    return payload.sub;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Public: list active builders
    const { rows } = await sql`
      SELECT id, name, email, location, address, phone, website, description,
             specialties, rating, reviews, is_verified, image, plan, status,
             gallery_images, created_at
      FROM builders
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;
    return res.status(200).json(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      location: r.location,
      address: r.address,
      phone: r.phone,
      website: r.website,
      description: r.description,
      specialties: r.specialties || [],
      rating: r.rating,
      reviews: r.reviews,
      isVerified: r.is_verified,
      image: r.image,
      plan: r.plan,
      status: r.status,
      galleryImages: r.gallery_images || [],
      createdAt: r.created_at,
    })));
  }

  if (req.method === 'POST') {
    const userId = await getClerkUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, email, location, address, phone, website, description, specialties, plan } = req.body;
    if (!name || !email || !location || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for existing listing
    const existing = await sql`SELECT id FROM builders WHERE owner_id = ${userId}`;
    if (existing.rows.length > 0) {
      return res.status(200).json({ id: existing.rows[0].id, alreadyExists: true });
    }

    const { rows } = await sql`
      INSERT INTO builders (owner_id, name, email, location, address, phone, website, description, specialties, plan, status, is_verified, gallery_images)
      VALUES (${userId}, ${name}, ${email}, ${location}, ${address || null}, ${phone}, ${website || null}, ${description || null}, ${JSON.stringify(specialties || [])}, ${plan || 'Basic'}, 'pending_approval', false, '[]')
      RETURNING id
    `;

    return res.status(201).json({ id: rows[0].id });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
