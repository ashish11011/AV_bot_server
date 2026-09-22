CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" serial NOT NULL,
	"salesforce_contact_id" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	CONSTRAINT "contacts_salesforce_contact_id_unique" UNIQUE("salesforce_contact_id"),
	CONSTRAINT "contacts_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" serial NOT NULL,
	"contact_id" uuid NOT NULL,
	"status" varchar(50) NOT NULL,
	"assigned_user" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"direction" varchar(10) NOT NULL,
	"content" varchar(1000) NOT NULL,
	"whatsapp_message_id" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesforce_connect" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" serial NOT NULL,
	"salesforce_api_url" varchar(512) NOT NULL,
	"salesforce_login_url" varchar(512) NOT NULL,
	"salesforce_token" varchar(512),
	"refresh_token" varchar(512),
	"instance_url" varchar(512),
	"signature" varchar(512),
	"client_id" varchar(255) NOT NULL,
	"c_secret" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"grant_type" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"tenant_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"phone" varchar(20),
	"email" varchar(255) NOT NULL,
	"bearer_token" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_phone_unique" UNIQUE("phone"),
	CONSTRAINT "tenants_email_unique" UNIQUE("email"),
	CONSTRAINT "tenants_bearer_token_unique" UNIQUE("bearer_token")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_connect" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" serial NOT NULL,
	"whatsapp_business_number" varchar(20) NOT NULL,
	"bussiness_account_id" varchar(255) NOT NULL,
	"api_version" varchar(512) NOT NULL,
	"access_token" varchar(512),
	"encrypted_token" varchar(512) NOT NULL,
	CONSTRAINT "whatsapp_connect_whatsapp_business_number_unique" UNIQUE("whatsapp_business_number")
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_tenants_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("tenant_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_tenants_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("tenant_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "salesforce_connect" ADD CONSTRAINT "salesforce_connect_tenant_id_tenants_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("tenant_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whatsapp_connect" ADD CONSTRAINT "whatsapp_connect_tenant_id_tenants_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("tenant_id") ON DELETE cascade ON UPDATE cascade;