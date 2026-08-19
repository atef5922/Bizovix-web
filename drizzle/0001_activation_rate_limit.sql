CREATE TABLE "activation_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"failures" integer DEFAULT 0 NOT NULL,
	"blocked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "activation_attempts_scope_window_key" ON "activation_attempts" USING btree ("scope","window_start");--> statement-breakpoint
CREATE INDEX "activation_attempts_updated_idx" ON "activation_attempts" USING btree ("updated_at");