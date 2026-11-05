CREATE TYPE "public"."budget_bucket" AS ENUM('needs', 'wants', 'savings');--> statement-breakpoint
ALTER TABLE "budget_limits" ADD COLUMN "bucket" "budget_bucket" DEFAULT 'needs' NOT NULL;