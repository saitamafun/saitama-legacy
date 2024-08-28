import { apps } from "@/db/schema";
import { limitOffsetPaginationSchema } from "@/lib/pagination";
import { createQuerySchema, queryBuilder } from "@/lib/query";

export const buildAppsQuery = queryBuilder(apps, {
  name: apps.name,
  createdAt: apps.createdAt,
});

export const appsQuerySchema = createQuerySchema(buildAppsQuery).partial();

export const getAppsQuerySchema =
  limitOffsetPaginationSchema.merge(appsQuerySchema);
