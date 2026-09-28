import {eq } from "drizzle-orm";
import {db,salesforceConnect} from "../../db/index.js";

type Connection = typeof salesforceConnect.$inferSelect;

// if salesforce is not connected throw this error and tell user to reconnect salesforce
export class SalesforceAuthError extends Error {}

async function getConnection(tenantId: number): Promise<Connection> {
  const [conn] = await db.select().from(salesforceConnect).where(eq(salesforceConnect.tenantId, tenantId));
  if (!conn) throw new SalesforceAuthError("Salesforce is not connected for this tenant");
  return conn;
}

// new token , save this in db and update the row
async function getNewToken(conn: Connection): Promise<Connection> {
  const body = new URLSearchParams({ client_id: conn.clientId, client_secret: conn.clientSecret });

  if (conn.refreshToken) {
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", conn.refreshToken);
  } else {
    body.set("grant_type", conn.grantType || "password"); // no refresh token -> log in again
    body.set("username", conn.username);
    body.set("password", conn.password);
  }

  // login url can be saved with or without "/services/oauth2/token" at the end
  const loginUrl = conn.salesforceLoginUrl.replace(/\/services\/oauth2\/token\/?$/, "").replace(/\/+$/, "");
  const res = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

if (!res.ok) throw new SalesforceAuthError(`Salesforce token refresh failed: ${await res.text()}`);
const data = (await res.json()) as {access_token: string; instance_url?: string};
const [row] = await db.update(salesforceConnect).set({salesforceToken: data.access_token,instanceUrl: data.instance_url ?? conn.instanceUrl,updatedAt: new Date()}).where(eq(salesforceConnect.tenantId, conn.tenantId)).returning();
return row;
}

const running = new Map<number, Promise<Connection>>();

function refreshOnce(conn: Connection): Promise<Connection>{
    if(!running.has(conn.tenantId)){
        running.set(conn.tenantId, getNewToken(conn).finally(()=> running.delete(conn.tenantId)));
    }
    return running.get(conn.tenantId)!;
}

function makeUrl(conn: Connection, path: string){
    if(path.startsWith("https://")) return path;
    const base = (conn.instanceUrl || conn.salesforceApiUrl).replace(/\/+$/, "");
    return base + (path.startsWith("/")?path:`/${path}`);
}

function send(conn: Connection, path: string, options: RequestInit) {
  return fetch(makeUrl(conn, path), {
    ...options,
    headers: { ...(options.headers as Record<string, string>), Authorization: `Bearer ${conn.salesforceToken}` },
  });
}

export async function salesforceRequest(tenantId: number, path: string, options: RequestInit = {}): Promise<Response> {
  let conn = await getConnection(tenantId);

  // No token saved yet so get one first
  if (!conn.salesforceToken) conn = await refreshOnce(conn);

  // Call Salesforce. If it works (not 401), we are done.
  const res = await send(conn, path, options);
  if (res.status !== 401) return res;

  // Token expired. Maybe another request already refreshed it so use that token and If not, get a new one (which is saved in DB).
  const latest = await getConnection(tenantId);
  const fresh = latest.salesforceToken !== conn.salesforceToken ? latest : await refreshOnce(latest);

  // Try the same request once more
  return send(fresh, path, options);
}
