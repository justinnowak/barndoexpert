import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.secret !== process.env.MIGRATION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS builders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT,
        phone TEXT NOT NULL,
        website TEXT,
        description TEXT,
        specialties JSONB DEFAULT '[]',
        rating NUMERIC(3,2),
        reviews INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        image TEXT,
        plan TEXT NOT NULL DEFAULT 'Basic',
        status TEXT NOT NULL DEFAULT 'pending_approval',
        gallery_images JSONB DEFAULT '[]',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_builder_id ON analytics(builder_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_builders_status ON builders(status)`;

    return res.status(200).json({ success: true, message: 'Tables created' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
