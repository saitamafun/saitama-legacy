import type { z } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { connection } from "@/lib/web3";
import { requestErrorHandler } from "@/lib/errorHandler";
import { selectPaymentById, selectPaymentSchema } from "@/db/zod";
import {
  createPayment,
  getPaymentByUserAndId,
  updatePaymentByUserAndId,
  verifyPaymentById,
} from "./payments.controller";
import { initializePaymentSchema, secureUpdateSchema } from "./payments.schema";
import { sendWebhookEvent } from "../../webhooks/webhooks.controller";

const createPaymentRoutes = (
  req: FastifyRequest<{ Body: z.infer<typeof initializePaymentSchema> }>,
  reply: FastifyReply
) =>
  initializePaymentSchema
    .parseAsync(req.body)
    .then(async (body) => {
      const payments = await createPayment(req.user!.id, body);
      if (payments && payments.length > 0) {
        const payment = payments.at(0)!;

        await sendWebhookEvent(req.user!.app!.id, "payment.initialize", payment);

        return payment;
      }

      return reply
        .status(403)
        .send({ message: "Can't initialize payment for app. Unauthorized" });
    })
    .catch(requestErrorHandler(reply));

const getPaymentRoutes = (
  req: FastifyRequest<{
    Params: z.infer<typeof selectPaymentById>;
  }>,
  reply: FastifyReply
) =>
  selectPaymentById
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const payments = await getPaymentByUserAndId(req.user!.id, id);
      if (payments.length > 0) return payments.at(0);

      return reply.status(404).send({ message: "Payment not found" });
    })
    .catch(requestErrorHandler(reply));

const updatePaymentRoutes = (
  req: FastifyRequest<{
    Params: z.infer<typeof selectPaymentById>;
    Body: z.infer<typeof secureUpdateSchema>;
  }>,
  reply: FastifyReply
) =>
  selectPaymentById
    .parseAsync(req.params)
    .then(({ id }) =>
      secureUpdateSchema
        .partial()
        .parseAsync(req.body)
        .then(async (body) => {
          const payments = await updatePaymentByUserAndId(
            req.user!.id,
            id,
            body
          );

          if (payments.length > 0) {
            const payment = payments.at(0)!;

            await sendWebhookEvent(
              req.user!.app!.id,
              "payment.updated",
              payment
            );

            return payment;
          }

          return reply.status(404).send({ message: "Payment not found" });
        })
    )
    .catch(requestErrorHandler(reply));

const verifyPaymentRoutes = (
  req: FastifyRequest<{ Params: z.infer<typeof selectPaymentById> }>,
  reply: FastifyReply
) =>
  selectPaymentById
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const payment = await verifyPaymentById(id, connection);
      if (payment)
        return selectPaymentSchema.omit({ wallet: true }).parseAsync(payment);
      return reply.status(404).send({ message: "Payment not found" });
    })
    .catch(requestErrorHandler(reply));

export const registerPaymentsRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/apps/payments/",
      preHandler: passport.authenticate(["app/token", "jwt"]),
      handler: createPaymentRoutes,
    })
    .route({
      method: "GET",
      url: "/apps/payments/:id/",
      preHandler: passport.authenticate(["app/token", "jwt"]),
      handler: getPaymentRoutes,
    })
    .route({
      method: "PATCH",
      url: "/apps/payments/:id/",
      preHandler: passport.authenticate(["app/token", "jwt"]),
      handler: updatePaymentRoutes,
    })
    .route({
      method: "GET",
      url: "/apps/payments/:id/_verify",
      preHandler: passport.authenticate(["app/token", "jwt"]),
      handler: verifyPaymentRoutes,
    });
};
