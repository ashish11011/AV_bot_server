import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db, salesforceConnect, whatsappConnect } from "../../db/index.js";

function parseTenantId(req: Request, res: Response): number | null {
  const tenantId = Number(req.params.tenantId);
  if (!Number.isInteger(tenantId)) {
    res.status(400).json({ msg: "invalid tenant id" });
    return null;
  }
  return tenantId;
}

export async function getSalesforceConnect(req: Request, res: Response) {
  const tenantId = parseTenantId(req, res);
  if (tenantId === null) return;

  try {
    const [row] = await db
      .select()
      .from(salesforceConnect)
      .where(eq(salesforceConnect.tenantId, tenantId));

    res.json({ data: row ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("getSalesforceConnect failed:", err);
    res.status(500).json({ msg: "could not fetch salesforce connect", error: message });
  }
}

export async function saveSalesforceConnect(req: Request, res: Response) {
  const tenantId = parseTenantId(req, res);
  if (tenantId === null) return;

  const {
    salesforceLoginUrl,
    salesforceApiUrl,
    salesforceToken,
    refreshToken,
    instanceUrl,
    signature,
    clientId,
    clientSecret,
    username,
    password,
    grantType,
  } = req.body ?? {};

  try {
    const [existing] = await db
      .select()
      .from(salesforceConnect)
      .where(eq(salesforceConnect.tenantId, tenantId));

    const values = {
      salesforceLoginUrl,
      salesforceApiUrl,
      salesforceToken,
      refreshToken,
      instanceUrl,
      signature,
      clientId,
      clientSecret,
      username,
      password,
      grantType,
    };

    if (existing) {
      const [row] = await db
        .update(salesforceConnect)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(salesforceConnect.tenantId, tenantId))
        .returning();
      return res.json({ data: row });
    }

    const [row] = await db
      .insert(salesforceConnect)
      .values({ ...values, tenantId })
      .returning();
    res.status(201).json({ data: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("saveSalesforceConnect failed:", err);
    res.status(400).json({ msg: "could not save salesforce connect", error: message });
  }
}

export async function deleteSalesforceConnect(req: Request, res: Response) {
  const tenantId = parseTenantId(req, res);
  if (tenantId === null) return;

  try {
    await db
      .delete(salesforceConnect)
      .where(eq(salesforceConnect.tenantId, tenantId));
    res.json({ data: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("deleteSalesforceConnect failed:", err);
    res.status(500).json({ msg: "could not delete salesforce connect", error: message });
  }
}

export async function getWhatsappConnect(req: Request, res: Response) {
  const tenantId = parseTenantId(req, res);
  if (tenantId === null) return;

  try {
    const [row] = await db
      .select()
      .from(whatsappConnect)
      .where(eq(whatsappConnect.tenantId, tenantId));

    res.json({ data: row ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("getWhatsappConnect failed:", err);
    res.status(500).json({ msg: "could not fetch whatsapp connect", error: message });
  }
}

export async function saveWhatsappConnect(req: Request, res: Response) {
  const tenantId = parseTenantId(req, res);
  if (tenantId === null) return;

  const {
    businessAccountId,
    apiVersion,
    accessToken,
    encryptedToken,
  } = req.body ?? {};

  try {
    const [existing] = await db
      .select()
      .from(whatsappConnect)
      .where(eq(whatsappConnect.tenantId, tenantId));

    const values = {
        businessAccountId,
      apiVersion,
      accessToken,
      encryptedToken,
    };

    if (existing) {
      const [row] = await db
        .update(whatsappConnect)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(whatsappConnect.tenantId, tenantId))
        .returning();
      return res.json({ data: row });
    }

    const [row] = await db
      .insert(whatsappConnect)
      .values({ ...values, tenantId })
      .returning();
    res.status(201).json({ data: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("saveWhatsappConnect failed:", err);
    res.status(400).json({ msg: "could not save whatsapp connect", error: message });
  }
}

export async function deleteWhatsappConnect(req: Request, res: Response) {
  const tenantId = parseTenantId(req, res);
  if (tenantId === null) return;

  try {
    await db
      .delete(whatsappConnect)
      .where(eq(whatsappConnect.tenantId, tenantId));
    res.json({ data: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("deleteWhatsappConnect failed:", err);
    res.status(500).json({ msg: "could not delete whatsapp connect", error: message });
  }
}