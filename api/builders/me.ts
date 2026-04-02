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
  const userId = await getClerkUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT id, name, email, location, address, phone, website, description,
             specialties, rating, reviews, is_verified, image, plan, status,
             gallery_images, stripe_customer_id, stripe_subscription_id,
             subscription_status, created_at, updated_at
      FROM builders
      WHERE owner_id = ${userId}
      LIMIT 1
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'No builder listing found' });
    const r = rows[0];
    return res.status(200).json({
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
      stripeCustomerId: r.stripe_customer_id,
      stripeSubscriptionId: r.stripe_subscription_id,
      subscriptionStatus: r.subscription_status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  }

  if (req.method === 'PATCH') {
    const { name, phone, website, description, specialties, location, address } = req.body;
    await sql`
      UPDATE builders
      SET name = ${name}, phone = ${phone}, website = ${website || null},
          description = ${description || null},
          specialties = ${JSON.stringify(specialties || [])},
          location = ${location}, address = ${address || null},
          updated_at = NOW()
      WHERE owner_id = ${userId}
    `;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
