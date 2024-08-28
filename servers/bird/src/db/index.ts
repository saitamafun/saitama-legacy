import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql, type Column } from "drizzle-orm";

export const createDB = <T extends Record<string, unknown>>(
  url: string,
  schema: T
) => {
  const client = postgres(url, { ssl: "DEBUG" in process.env });

  return drizzle(client, { schema });
};

export const as = <T extends Column | string, U extends string>(
  column: T,
  name: U
) => sql`${column}`.as(name);
