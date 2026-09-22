CREATE TABLE "api_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salesforce_connect_id" uuid NOT NULL,
	"api_endpoint" varchar(255) NOT NULL,
	"field_mapping" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_connect_number" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"whatsapp_connect_id" uuid NOT NULL,
	"number_id" varchar(512) NOT NULL,
	"phone_number" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_connect_number_number_id_unique" UNIQUE("number_id"),
	CONSTRAINT "whatsapp_connect_number_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "contacts" CASCADE;--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
ALTER TABLE "whatsapp_connect" DROP CONSTRAINT "whatsapp_connect_whatsapp_business_number_unique";--> statement-breakpoint
ALTER TABLE "whatsapp_connect" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "whatsapp_connect" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "api_mapping" ADD CONSTRAINT "api_mapping_salesforce_connect_id_salesforce_connect_id_fk" FOREIGN KEY ("salesforce_connect_id") REFERENCES "public"."salesforce_connect"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whatsapp_connect_number" ADD CONSTRAINT "whatsapp_connect_number_whatsapp_connect_id_whatsapp_connect_id_fk" FOREIGN KEY ("whatsapp_connect_id") REFERENCES "public"."whatsapp_connect"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whatsapp_connect" DROP COLUMN "whatsapp_business_number";