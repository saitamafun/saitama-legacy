import type { z } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { requestErrorHandler } from "@/lib/errorHandler";
import { insertWebhookSchema, selectWebhookById } from "@/db/zod";

import { buildURLFromRequest } from "@/lib/utils";
import { LimitOffsetPagination } from "@/lib/pagination";

import {
  createWebhook,
  deleteWebhookByUserAndId,
  getWebhooksByUser,
  updateWebhookByUserAndId,
} from "./webhooks.controller";
import { buildWebhooksQuery, getWebhooksQuerySchema } from "./webhooks.query";

const createWebhookRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof insertWebhookSchema> }>,
  reply: FastifyReply
) =>
  insertWebhookSchema
    .parseAsync(req.body)
    .then(async (body) => {
      const webhooks = await createWebhook(req.user!.id, body);
      if (webhooks && webhooks.length > 0) return webhooks.at(0);
      return reply
        .status(400)
        .send({ message: "Unauthorized to create webhook on app" });
    })
    .catch(requestErrorHandler(reply));

const getWebhooksRoute = (
  req: FastifyRequest<{
    Querystring: z.infer<typeof getWebhooksQuerySchema>;
  }>,
  reply: FastifyReply
) =>
  getWebhooksQuerySchema
    .parseAsync(req.query)
    .then(async ({ limit, offset, ...rest }) => {
      const where = buildWebhooksQuery(rest);

      const paginator = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit,
        offset
      );
      return paginator.getResponse(
        await getWebhooksByUser(
          req.user!.id,
          paginator.limit,
          paginator.getOffset(),
          where
        )
      );
    })
    .catch(requestErrorHandler(reply));

const updateWebhookRoute = (
  req: FastifyRequest<{
    Params: z.infer<typeof selectWebhookById>;
    Body: z.infer<typeof insertWebhookSchema>;
  }>,
  reply: FastifyReply
) =>
  selectWebhookById
    .parseAsync(req.params)
    .then(({ id }) =>
      insertWebhookSchema
        .pick({ url: true })
        .parseAsync(req.body)
        .then(async (body) => {
          const webhooks = await updateWebhookByUserAndId(
            req.user!.id,
            id,
            body
          );
          if (webhooks.length > 0) return webhooks.at(0);
          return reply.status(404).send({ message: "Webhook not found" });
        })
    )
    .catch(requestErrorHandler(reply));

const deleteWebhookRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectWebhookById> }>,
  reply: FastifyReply
) =>
  selectWebhookById
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const webhooks = await deleteWebhookByUserAndId(req.user!.id, id);
      if (webhooks.length > 0) return webhooks.at(0);
      return reply.status(404).send({ message: "Webhook not found" });
    })
    .catch(requestErrorHandler(reply));

export const registerWebhooksRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/apps/webhooks/",
      preHandler: passport.authenticate("jwt"),
      handler: createWebhookRoute,
    })
    .route({
      method: "GET",
      url: "/apps/webhooks/",
      preHandler: passport.authenticate("jwt"),
      handler: getWebhooksRoute,
    })
    .route({
      method: "PATCH",
      url: "/apps/webhooks/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: updateWebhookRoute,
    })
    .route({
      method: "DELETE",
      url: "/apps/webhooks/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: deleteWebhookRoute,
    });
};
