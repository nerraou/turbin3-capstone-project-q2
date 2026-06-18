CREATE TYPE "public"."role" AS ENUM('traveler', 'merchant', 'admin');--> statement-breakpoint
CREATE TABLE "merchants_profiles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar,
	"user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redemption_requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"merchant_user_id" bigint NOT NULL,
	"merchant_wallet" text NOT NULL,
	"merchant_account" text NOT NULL,
	"merchant_ata" text NOT NULL,
	"redemption_request" text NOT NULL,
	"redemption_id" text NOT NULL,
	"amount" text NOT NULL,
	"amount_usd" text NOT NULL,
	"currency" text NOT NULL,
	"decimals" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"request_tx" text NOT NULL,
	"approve_tx" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redemption_requests_redemption_request_unique" UNIQUE("redemption_request"),
	CONSTRAINT "redemption_requests_merchant_redemption_id_unique" UNIQUE("merchant_wallet","redemption_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"chain" text NOT NULL,
	"address" text NOT NULL,
	"encrypted_private_key" text NOT NULL,
	"encrypted_dek" text NOT NULL,
	"key_version" text DEFAULT 'v1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_address_unique" UNIQUE("address")
);
