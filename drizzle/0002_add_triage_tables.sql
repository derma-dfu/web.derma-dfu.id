CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"triage_id" text NOT NULL,
	"doctor_id" text,
	"facility" text,
	"consultation_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"scheduled_date" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"photo_url" text,
	"has_scale_card" boolean DEFAULT false,
	"triage_result" text NOT NULL,
	"has_fever" boolean DEFAULT false,
	"has_smell_pus" boolean DEFAULT false,
	"has_spreading_redness" boolean DEFAULT false,
	"has_rest_pain" boolean DEFAULT false,
	"has_foot_pulse" boolean DEFAULT true,
	"has_black_cold_skin" boolean DEFAULT false,
	"wound_duration" integer,
	"wound_location" text,
	"diabetes_history" text,
	"kidney_condition" text,
	"abi_value" text,
	"notes" text,
	"infection_class" integer,
	"infection_prob" text,
	"infection_prob_present" text,
	"ischaemia_prob" text,
	"top_class_name" text,
	"top_class_prob" text,
	"wound_area_px" integer,
	"wound_area_pct" text,
	"wound_area_cm2" text,
	"calibration_mm_per_px" text,
	"model_gated" boolean DEFAULT false,
	"ai_summary" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_triage_id_triage_records_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triage_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_records" ADD CONSTRAINT "triage_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;