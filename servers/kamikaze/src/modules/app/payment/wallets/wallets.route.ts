import type { z } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { LimitOffsetPagination } from "@/lib/pagination";
import { insertWalletSchema, selectWalletByIdSchema } from "@/db/zod";

import { buildURLFromRequest } from "@/lib/utils";
import { requestErrorHandler } from "@/lib/errorHandler";

import {
  createWallet,
  deleteWalletByUserAndId,
  getWalletsByUser,
  updateWalletByUserAndId,
} from "./wallets.controller";
import { buildWalletsQuery, getWalletsQuerySchema } from "./wallets.query";

const createWalletRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof insertWalletSchema> }>,
  reply: FastifyReply
) =>
  insertWalletSchema
    .parseAsync(req.body)
    .then(async (body) => {
      const wallets = await createWallet(req.user!.id, body);
      if (wallets && wallets.length > 0) return wallets.at(0);
      return reply.status(400).send({ message: "Invalid or unauthorized app" });
    })
    .catch(requestErrorHandler(reply));

const getWalletsRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof getWalletsQuerySchema> }>,
  reply: FastifyReply
) =>
  getWalletsQuerySchema
    .parseAsync(req.query)
    .then(async ({ limit, offset, ...rest }) => {
      const where = buildWalletsQuery(rest);
      const paginator = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit,
        offset
      );
      return paginator.getResponse(
        await getWalletsByUser(
          req.user!.id,
          paginator.limit,
          paginator.getOffset(),
          where
        )
      );
    })
    .catch(requestErrorHandler(reply));

const updateWalletRoute = (
  req: FastifyRequest<{
    Params: z.infer<typeof selectWalletByIdSchema>;
    Body: z.infer<typeof insertWalletSchema>;
  }>,
  reply: FastifyReply
) =>
  selectWalletByIdSchema
    .parseAsync(req.params)
    .then(async ({ id }) =>
      insertWalletSchema
        .partial()
        .parseAsync(req.body)
        .then(async (body) => {
          const wallets = await updateWalletByUserAndId(req.user!.id, id, body);
          if (wallets.length > 0) return wallets.at(0);
          return reply.status(404).send({ message: "wallet not found" });
        })
    )
    .catch(requestErrorHandler(reply));

const deleteWalletRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectWalletByIdSchema> }>,
  reply: FastifyReply
) =>
  selectWalletByIdSchema
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const wallets = await deleteWalletByUserAndId(req.user!.id, id);
      if (wallets.length > 0) return wallets.at(0);
      return reply.status(404).send({ message: "wallet not found" });
    })
    .catch(requestErrorHandler(reply));

export const registerWalletsRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/apps/wallets/",
      preHandler: passport.authenticate("jwt"),
      handler: createWalletRoute,
    })
    .route({
      method: "GET",
      url: "/apps/wallets/",
      preHandler: passport.authenticate("jwt"),
      handler: getWalletsRoute,
    })
    .route({
      method: "PATCH",
      url: "/apps/wallets/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: updateWalletRoute,
    })
    .route({
      method: "DELETE",
      url: "/apps/wallets/:id/",
      preHandler: passport.authenticate("jwt"),
      handler: deleteWalletRoute,
    });
};
