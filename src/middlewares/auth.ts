import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, tenants } from '../../db/index.js';

declare global {
  namespace Express {
    interface Request {
      tenant?: typeof tenants.$inferSelect;
    }
  }
}

export async function verifyTenantToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(403).json({ msg: 'Missing or invalid auth header' });
  }
  try {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.bearerToken, token));
    if (!tenant) {
      return res.status(403).json({ msg: 'Invalid token' });
    }
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('verifyTenantToken failed:', error);
    return res.status(500).json({ msg: 'Could not verify token' });
  }
}
