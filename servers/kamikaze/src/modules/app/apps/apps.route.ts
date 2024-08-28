import type { z } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { buildURLFromRequest } from "@/lib/utils";
import { requestErrorHandler } from "@/lib/errorHandler";
import { LimitOffsetPagination } from "@/lib/pagination";
import { insertAppSchema, selectAppByIdSchema } from "@/db/zod";

import { buildAppsQuery, getAppsQuerySchema } from "./apps.query";
import {
  createApp,
  deleteAppByUserAndId,
  getAppByUserAndId,
  getAppsByUser,
  updateAppByUserAndId,
} from "./apps.controller";

const createAppRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof insertAppSchema> }>,
  reply: FastifyReply
) => {
  return insertAppSchema
    .omit({ user: true })
    .parseAsync(req.body)
    .then(async (body) => createApp({ ...body, user: req.user!.id }))
    .catch(requestErrorHandler(reply));
};
const getContextAppRoute = (req: FastifyRequest) => req.user!.app!;

const getAppsRoute = (
  req: FastifyRequest<{
    Querystring: z.infer<typeof getAppsQuerySchema>;
  }>,
  reply: FastifyReply
) =>
  getAppsQuerySchema
    .parseAsync(req.query)
    .then(async ({ limit, offset, ...rest }) => {
      const where = buildAppsQuery(rest);
      const pagination = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit,
        offset
      );
      return pagination.getResponse(
        await getAppsByUser(
          req.user!.id,
          pagination.limit,
          pagination.getOffset(),
          where
        )
      );
    })
    .catch(requestErrorHandler(reply));

const getAppRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectAppByIdSchema> }>,
  reply: FastifyReply
) =>
  selectAppByIdSchema
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const app = await getAppByUserAndId(req.user!.id, id);
      if (app) return app;
      return reply.status(404).send({ message: "No app with id found" });
    })
    .catch(requestErrorHandler(reply));

const updateAppRoute = (
  req: FastifyRequest<{
    Params: z.infer<typeof selectAppByIdSchema>;
    Body: z.infer<typeof insertAppSchema>;
  }>,
  reply: FastifyReply
) =>
  selectAppByIdSchema
    .parseAsync(req.params)
    .then(({ id }) =>
      insertAppSchema
        .partial()
        .parseAsync(req.body)
        .then(async (body) => {
          const apps = await updateAppByUserAndId(req.user!.id, id, body);
          if (apps.length > 0) return apps.at(0);
          return reply.status(404).send({ message: "app with id not found" });
        })
    )
    .catch(requestErrorHandler(reply));

const deleteAppRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectAppByIdSchema> }>,
  reply: FastifyReply
) =>
  selectAppByIdSchema
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const apps = await deleteAppByUserAndId(req.user!.id, id);
      if (apps.length > 0) return apps.at(0)!;
      return reply.status(404).send({ message: "app with id not found" });
    })
    .catch(requestErrorHandler(reply));

export const registerAppsRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/apps/",
      preHandler: passport.authenticate("jwt"),
      handler: createAppRoute,
    })
    .route({
      method: "GET",
      url: "/apps/",
      preHandler: passport.authenticate("jwt"),
      handler: getAppsRoute,
    })
    .route({
      method: "GET",
      url: "/apps/:id/",
      preHandler: passport.authenticate(["app/token", "jwt"]),
      handler: getAppRoute,
    })
    .route({
      method: "GET",
      url: "/apps/me/",
      preHandler: passport.authenticate("app/token"),
      handler: getContextAppRoute,
    })
    .route({
      method: "PATCH",
      url: "/apps/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: updateAppRoute,
    })
    .route({
      method: "DELETE",
      url: "/apps/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: deleteAppRoute,
    });
};
