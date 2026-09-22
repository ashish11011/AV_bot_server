import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db, tenants } from "../../db/index.js";

function generateBearerToken() {
  return randomBytes(32).toString("hex");
}

export async function listTenants(_req: Request, res: Response) {
  const rows = await db.select().from(tenants).orderBy(tenants.tenantId);
  res.json({ data: rows });
}

export async function getTenant(req: Request, res: Response) {
  const tenantId = Number(req.params.tenantId);
  if (!Number.isInteger(tenantId)) {
    return res.status(400).json({ msg: "invalid tenant id" });
  }

  const [row] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.tenantId, tenantId));

  if (!row) return res.status(404).json({ msg: "tenant not found" });
  res.json({ data: row });
}

export async function createTenant(req: Request, res: Response) {
  const { name, companyName, phone, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ msg: "name and email are required" });
  }

  const bearerToken = generateBearerToken();

  try {
    const [row] = await db
      .insert(tenants)
      .values({ name, companyName, phone, email, bearerToken })
      .returning();

    res.status(201).json({ data: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ msg: "could not create tenant", error: message });
  }
}

export async function updateTenant(req: Request, res: Response) {
  const tenantId = Number(req.params.tenantId);
  if (!Number.isInteger(tenantId)) {
    return res.status(400).json({ msg: "invalid tenant id" });
  }

  const { name, companyName, phone, email } = req.body ?? {};

  try {
    const [row] = await db
      .update(tenants)
      .set({ name, companyName, phone, email, updatedAt: new Date() })
      .where(eq(tenants.tenantId, tenantId))
      .returning();

    if (!row) return res.status(404).json({ msg: "tenant not found" });
    res.json({ data: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ msg: "could not update tenant", error: message });
  }
}

export async function generateTenantBearerToken(req: Request, res: Response) {
  const tenantId = Number(req.params.tenantId);
  if (!Number.isInteger(tenantId)) {
    return res.status(400).json({ msg: "invalid tenant id" });
  }

  try {
    const [row] = await db
      .update(tenants)
      .set({ bearerToken: generateBearerToken(), updatedAt: new Date() })
      .where(eq(tenants.tenantId, tenantId))
      .returning();

    if (!row) return res.status(404).json({ msg: "tenant not found" });
    res.json({ data: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ msg: "could not generate bearer token", error: message });
  }
}

export async function deleteTenant(req: Request, res: Response) {
  const tenantId = Number(req.params.tenantId);
  if (!Number.isInteger(tenantId)) {
    return res.status(400).json({ msg: "invalid tenant id" });
  }

  await db.delete(tenants).where(eq(tenants.tenantId, tenantId));
  res.status(204).send();
}
