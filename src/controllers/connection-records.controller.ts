import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, salesforceConnect, whatsappConnect, whatsappConnectNumber, ApiMapping } from "../../db/index.js";

const VALID_MAPPING_TYPES = ["Account", "Deals", "ScheduleBooking", "WhatsAppMessage"];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validParams(req: Request, res: Response) {
  if (!Number.isSafeInteger(Number(req.params.tenantId)) || Number(req.params.tenantId) <= 0 ||
      (req.params.id !== undefined && !uuidPattern.test(String(req.params.id)))) {
    res.status(400).json({ msg: "Invalid tenant or record ID" });
    return false;
  }
  return true;
}
function handleError(res: Response, error: unknown) {
  const cause = error as { code?: string; cause?: { code?: string } };
  if ((cause.code ?? cause.cause?.code) === "23505") {
    return res.status(409).json({ msg: "Number ID or phone number already exists" });
  }
  console.error("Connection record request failed:", error);
  return res.status(500).json({ msg: "Could not process connection record" });
}

export async function handleWhatsappNumber(req: Request, res: Response) {
  if (!validParams(req, res)) return;
  try {
    const [parent] = await db.select({ id: whatsappConnect.id }).from(whatsappConnect)
      .where(eq(whatsappConnect.tenantId, Number(req.params.tenantId)));
    if (!parent) return res.status(404).json({ msg: "Connection not found. Save the connection first." });
    const scope = eq(whatsappConnectNumber.whatsappConnectId, parent.id);
    const condition = req.params.id ? and(scope, eq(whatsappConnectNumber.id, String(req.params.id))) : scope;
    if (req.method === "GET") {
      const rows = await db.select().from(whatsappConnectNumber).where(condition).orderBy(whatsappConnectNumber.createdAt);
      if (req.params.id && !rows[0]) return res.status(404).json({ msg: "Record not found" });
      return res.json({ data: req.params.id ? rows[0] : rows });
    }
    if (req.method === "DELETE") {
      const rows = await db.delete(whatsappConnectNumber).where(condition).returning();
      if (!rows.length) return res.status(404).json({ msg: "Record not found" });
      return res.json({ data: null });
    }
    const { numberId, phoneNumber } = req.body ?? {};
      if (![numberId, phoneNumber].every(value => typeof value === "string" && value.trim().length > 0 && value.trim().length <= 512)) {
        return res.status(400).json({ msg: "Number ID and phone number are required (maximum 512 characters)" });
      }
      const values = { numberId: numberId.trim(), phoneNumber: phoneNumber.trim() };
    if (req.method === "POST") {
      const [row] = await db.insert(whatsappConnectNumber).values({ ...values, whatsappConnectId: parent.id }).returning();
      return res.status(201).json({ data: row });
    }
    const [row] = await db.update(whatsappConnectNumber).set({ ...values, updatedAt: new Date() }).where(condition).returning();
    if (!row) return res.status(404).json({ msg: "Record not found" });
    return res.json({ data: row });
  } catch (error) { return handleError(res, error); }
}

export async function handleApiMapping(req: Request, res: Response) {
  if (!validParams(req, res)) return;
  try {
    const [parent] = await db.select({ id: salesforceConnect.id }).from(salesforceConnect)
      .where(eq(salesforceConnect.tenantId, Number(req.params.tenantId)));
    if (!parent) return res.status(404).json({ msg: "Connection not found. Save the connection first." });
    const scope = eq(ApiMapping.salesforceConnectId, parent.id);
    const condition = req.params.id ? and(scope, eq(ApiMapping.id, String(req.params.id))) : scope;
    if (req.method === "GET") {
      const rows = await db.select().from(ApiMapping).where(condition).orderBy(ApiMapping.createdAt);
      if (req.params.id && !rows[0]) return res.status(404).json({ msg: "Record not found" });
      return res.json({ data: req.params.id ? rows[0] : rows });
    }
    if (req.method === "DELETE") {
      const rows = await db.delete(ApiMapping).where(condition).returning();
      if (!rows.length) return res.status(404).json({ msg: "Record not found" });
      return res.json({ data: null });
    }
    const { apiEndpoint, apiMappingType, fieldMapping } = req.body ?? {};
      if (typeof apiEndpoint !== "string" || !apiEndpoint.trim() || apiEndpoint.trim().length > 255) {
        return res.status(400).json({ msg: "API endpoint is required (maximum 255 characters)" });
      }
      if (!VALID_MAPPING_TYPES.includes(apiMappingType)) {
        return res.status(400).json({ msg: `API mapping type must be one of: ${VALID_MAPPING_TYPES.join(", ")}` });
      }
      if (fieldMapping === null || typeof fieldMapping !== "object" || Array.isArray(fieldMapping)) {
        return res.status(400).json({ msg: "Field mapping must be a JSON object" });
      }
      const values = { apiEndpoint: apiEndpoint.trim(), apiMappingType, fieldMapping };
    if (req.method === "POST") {
      const [row] = await db.insert(ApiMapping).values({ ...values, salesforceConnectId: parent.id }).returning();
      return res.status(201).json({ data: row });
    }
    const [row] = await db.update(ApiMapping).set({ ...values, updatedAt: new Date() }).where(condition).returning();
    if (!row) return res.status(404).json({ msg: "Record not found" });
    return res.json({ data: row });
  } catch (error) { return handleError(res, error); }
}