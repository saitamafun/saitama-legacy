import { wallets } from "@/db/schema";
import { limitOffsetPaginationSchema } from "@/lib/pagination";
import { createQuerySchema, queryBuilder } from "@/lib/query";

export const buildWalletsQuery = queryBuilder(wallets, {
  app: wallets.app,
});

export const walletsQuerySchema =
  createQuerySchema(buildWalletsQuery).partial();

export const getWalletsQuerySchema =
  limitOffsetPaginationSchema.merge(walletsQuerySchema);
