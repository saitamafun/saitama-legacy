import { webhooks } from "@/db/schema";
import { limitOffsetPaginationSchema } from "@/lib/pagination";
import { createQuerySchema, queryBuilder } from "@/lib/query";

export const buildWebhooksQuery = queryBuilder(webhooks, {
  app: webhooks.app,
});

export const webhooksQuerySchema =
  createQuerySchema(buildWebhooksQuery).partial();

export const getWebhooksQuerySchema =
  limitOffsetPaginationSchema.merge(webhooksQuerySchema);
