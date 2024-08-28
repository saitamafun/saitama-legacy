CREATE TABLE IF NOT EXISTS "botUsers" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text,
	"chat_id" text NOT NULL,
	CONSTRAINT "botUsers_id_unique" UNIQUE("id"),
	CONSTRAINT "username" UNIQUE NULLS NOT DISTINCT("username")
);
