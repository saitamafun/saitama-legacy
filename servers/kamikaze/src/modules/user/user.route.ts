import type { z } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { insertUserSchema } from "@/db/zod";
import { requestErrorHandler } from "@/lib/errorHandler";

import { cleanUserSchema } from "./user.schema";
import { deleteUserById, getUserById, updateUserById } from "./user.controller";

const getUserRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = await getUserById(req.user!.id);
  if (user)
    return cleanUserSchema.parseAsync(user).catch(requestErrorHandler(reply));

  return reply.status(404).send({ message: "user not found" });
};

const updateUserRoute = (
  req: FastifyRequest<{
    Body: z.infer<typeof insertUserSchema>;
  }>,
  reply: FastifyReply
) =>
  insertUserSchema
    .partial()
    .parseAsync(req.body)
    .then(async (body) => {
      const users = await updateUserById(req.user!.id, body);
      if (users.length > 0) return cleanUserSchema.parseAsync(users.at(0));
      return reply.status(404).send({
        message: "User not found or don't have access to update user",
      });
    })
    .catch(requestErrorHandler(reply));

const deleteUserRoute = async (req: FastifyRequest, reply: FastifyReply) => {
  const users = await deleteUserById(req.user!.id);
  if (users.length > 0) return cleanUserSchema.parseAsync(users.at(0)!);
  return reply.status(404).send({
    message: "User not found or don't have access to to delete this user",
  });
};

export const registerUsersRoutes = (app: FastifyInstance) => {
  app
    .route({
      url: "/users/me/",
      method: "GET",
      preHandler: passport.authenticate("jwt"),
      handler: getUserRoute,
    })
    .route({
      url: "/users/me/",
      method: "PATCH",
      preHandler: passport.authenticate("jwt"),
      handler: updateUserRoute,
    })
    .route({
      url: "/users/me/",
      method: "DELETE",
      preHandler: passport.authenticate("jwt"),
      handler: deleteUserRoute,
    });
};
