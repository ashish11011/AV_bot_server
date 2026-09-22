import { pgTable, timestamp, uuid, varchar, serial, jsonb } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { databaseUrl } from "../src/config/env.js";

export const tenants = pgTable("tenants", {
  tenantId: serial("tenant_id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  bearerToken: varchar("bearer_token", { length: 512 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesforceConnect = pgTable("salesforce_connect", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: serial("tenant_id").references(() => tenants.tenantId, {onDelete:"cascade",onUpdate:"cascade"}).notNull(), 
  salesforceApiUrl: varchar("salesforce_api_url", { length: 512 }).notNull(),   
  salesforceLoginUrl: varchar("salesforce_login_url", { length: 512 }).notNull(),
  salesforceToken: varchar("salesforce_token", { length: 512 }),
  refreshToken: varchar("refresh_token", { length: 512 }),
  instanceUrl: varchar("instance_url", { length: 512 }),
  signature: varchar("signature", { length: 512 }),
  
  clientId: varchar("client_id", { length: 255 }).notNull(), 
  clientSecret: varchar("c_secret", { length: 255 }).notNull(), 
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  grantType: varchar("grant_type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(), 
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappConnect = pgTable("whatsapp_connect", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: serial("tenant_id").references(() => tenants.tenantId, {onDelete:"cascade",onUpdate:"cascade"}).notNull(),
  businessAccountId: varchar("bussiness_account_id", { length: 255 }).notNull(),
  apiVersion: varchar("api_version", { length: 512 }).notNull(),
  accessToken: varchar("access_token", { length: 512 }),
  encryptedToken: varchar("encrypted_token", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(), 
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappConnectNumber = pgTable("whatsapp_connect_number", {
  id: uuid("id").defaultRandom().primaryKey(),
  whatsappConnectId: uuid("whatsapp_connect_id").references(() => whatsappConnect.id, {onDelete:"cascade",onUpdate:"cascade"}).notNull(),
  numberId: varchar("number_id", { length: 512 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 512 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(), 
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ApiMapping = pgTable("api_mapping",{
  id: uuid("id").defaultRandom().primaryKey(),
  salesforceConnectId: uuid("salesforce_connect_id").references(() => salesforceConnect.id, {onDelete:"cascade",onUpdate:"cascade"}).notNull(),
  apiEndpoint: varchar("api_endpoint", { length: 255 }).notNull(),
  apiMappingType: varchar("api_mapping_type", { length: 255 }).notNull(),
  fieldMapping: jsonb("field_mapping").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(), 
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Supabase's transaction-mode pooler (port 6543) doesn't support prepared
// statements, so they're disabled here.
const queryClient = postgres(databaseUrl, { prepare: false });

// Ready-to-use drizzle client — controllers just import `db` from this file.
export const db = drizzle(queryClient);