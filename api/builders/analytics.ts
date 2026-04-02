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
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Track an analytics event (public)
    const { builderId, type } = req.body;
    if (!builderId || !['website', 'email', 'call', 'profile_view'].includes(type)) {
      return res.status(400).json({ error: 'Invalid event' });
    }
    await sql`
      INSERT INTO analytics (builder_id, type, user_agent)
      VALUES (${builderId}, ${type}, ${req.headers['user-agent'] || null})
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    // Get analytics for current user's builder
    const userId = await getClerkUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { rows: builderRows } = await sql`SELECT id FROM builders WHERE owner_id = ${userId} LIMIT 1`;
    if (builderRows.length === 0) return res.status(404).json({ error: 'No builder found' });
    const builderId = builderRows[0].id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { rows } = await sql`
      SELECT type, created_at::date as date, COUNT(*) as count
      FROM analytics
      WHERE builder_id = ${builderId} AND created_at >= ${thirtyDaysAgo.toISOString()}
      GROUP BY type, created_at::date
      ORDER BY date ASC
    `;

    let profileViews = 0, websiteClicks = 0, emailClicks = 0, phoneCalls = 0;
    const dailyMap: Record<string, { views: number; clicks: number }> = {};

    for (const row of rows) {
      const dateKey = new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { views: 0, clicks: 0 };
      const count = Number(row.count);
      switch (row.type) {
        case 'profile_view': profileViews += count; dailyMap[dateKey].views += count; break;
        case 'website': websiteClicks += count; dailyMap[dateKey].clicks += count; break;
        case 'email': emailClicks += count; break;
        case 'call': phoneCalls += count; break;
      }
    }

    return res.status(200).json({
      profileViews, websiteClicks, emailClicks, phoneCalls,
      chartData: Object.entries(dailyMap).map(([date, data]) => ({ date, ...data })).slice(-14),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
