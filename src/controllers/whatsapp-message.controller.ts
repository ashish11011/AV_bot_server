import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";

import { db, whatsappConnect, whatsappConnectNumber } from "../../db/index.js";

export async function sendWhatsappMessage(req: Request, res: Response) {

  const tenant = req.tenant;
  if (!tenant) return res.status(403).json({ msg: "Not authenticated" });

  const { to, body, numberId } = req.body ?? {};
  if (typeof to !== "string" || !to.trim() || typeof body !== "string" || !body.trim()) {
    return res.status(400).json({ msg: "'to' (recipient number) and 'body' (message text) are required" });
  }

  try {

    const [connect] = await db.select().from(whatsappConnect).where(eq(whatsappConnect.tenantId, tenant.tenantId));
    if (!connect) {
      return res.status(403).json({ msg: "WhatsApp is not connected for this tenant" });
    }

    const numbersScope = eq(whatsappConnectNumber.whatsappConnectId, connect.id);
    const condition = numberId ? and(numbersScope, eq(whatsappConnectNumber.numberId, String(numberId))) : numbersScope;
    const [number] = await db.select().from(whatsappConnectNumber).where(condition).orderBy(whatsappConnectNumber.createdAt);

    if (!number) {
      return res.status(403).json({ msg: "No WhatsApp number configured for this tenant" });
    }
    if (!connect.accessToken) {
      return res.status(500).json({ msg: "WhatsApp access token is missing for this tenant" });
    }

    const response = await fetch(
      `https://graph.facebook.com/${connect.apiVersion}/${number.numberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connect.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to.trim(),
          type: "text",
          text: { body: body.trim() },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`WhatsApp API error (${response.status}):`, errorBody);
      return res.status(502).json({ msg: "Failed to send WhatsApp message", error: errorBody });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("sendWhatsappMessage failed:", error);
    return res.status(500).json({ msg: "Could not send WhatsApp message" });
  }
}