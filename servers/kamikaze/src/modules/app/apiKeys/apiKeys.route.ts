import type { z } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { insertApiKeySchema, selectApiKeyByIdSchema } from "@/db/zod";
import { requestErrorHandler } from "@/lib/errorHandler";
import { buildURLFromRequest } from "@/lib/utils";
import {
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "@/lib/pagination";

import {
  createApiKey,
  deleteApiKeyByUserAndId,
  getApiKeysByUser,
} from "./apiKeys.controller";

const createApiKeyRoute = async (
  req: FastifyRequest<{ Body: z.infer<typeof insertApiKeySchema> }>,
  reply: FastifyReply
) =>
  insertApiKeySchema
    .parseAsync(req.body)
    .then(async (body) => {
      const apiKey = await createApiKey(req.user!.id, body);
      if (apiKey) return apiKey;

      return reply
        .status(403)
        .send({ message: "User not authorized or app not found" });
    })
    .catch(requestErrorHandler(reply));

const getApiKeysRoute = (
  req: FastifyRequest<{
    Querystring: z.infer<typeof limitOffsetPaginationSchema>;
  }>,
  reply: FastifyReply
) =>
  limitOffsetPaginationSchema
    .parseAsync(req.query)
    .then(async ({ limit, offset }) => {
      const paginator = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit,
        offset
      );

      return paginator.getResponse(
        await getApiKeysByUser(
          req.user!.id,
          paginator.limit,
          paginator.getOffset()
        )
      );
    })
    .catch(requestErrorHandler(reply));

const deleteApiKeyRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectApiKeyByIdSchema> }>,
  reply: FastifyReply
) =>
  selectApiKeyByIdSchema
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const apiKeys = await deleteApiKeyByUserAndId(req.user!.id, id);
      if (apiKeys.length > 0) return apiKeys.at(0);

      return reply.status(404).send({ message: "Api key not found" });
    })
    .catch(requestErrorHandler(reply));

export const registerApiKeyRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/apps/apiKeys/",
      preHandler: passport.authenticate("jwt"),
      handler: createApiKeyRoute,
    })
    .route({
      method: "GET",
      url: "/apps/apiKeys/",
      preHandler: passport.authenticate("jwt"),
      handler: getApiKeysRoute,
    })
    .route({
      method: "DELETE",
      url: "/apps/apiKeys/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: deleteApiKeyRoute,
    });
};
