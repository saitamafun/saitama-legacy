import bcrypt from "bcrypt";
import type { z } from "zod";
import jsonwebtoken from "jsonwebtoken";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { SECRET_KEY } from "@/config";
import { insertUserSchema } from "@/db/zod";
import { createUser } from "../user/user.controller";
import { requestErrorHandler } from "@/lib/errorHandler";

import { authBodySchema } from "./auth.schema";
import { authenticateWithEmailAndPassword } from "./auth.controller";

const signUpRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof insertUserSchema> }>,
  reply: FastifyReply
) =>
  insertUserSchema
    .parseAsync(req.body)
    .then(async (body) => {
      body.password = await bcrypt.hash(body.password, 10);
      const [user] = await createUser(body);
      return user;
    })
    .catch(requestErrorHandler(reply));

const signInRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof authBodySchema> }>,
  reply: FastifyReply
) =>
  authBodySchema
    .parseAsync(req.body)
    .then(async (body) => {
      const user = await authenticateWithEmailAndPassword(
        body.email,
        body.password
      );
      if (user) {
        const token = jsonwebtoken.sign(
          {
            id: user.id,
            email: user.email,
            lastLogin: user.lastLogin,
          },
          SECRET_KEY
        );
        return reply.setCookie("jwt", token).send({ token });
      }
      return reply.status(403).send({ message: "Invalid email or password" });
    })
    .catch(requestErrorHandler(reply));

export const registerAuthRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/auth/signUp/",
      handler: signUpRoute,
    })
    .route({
      method: "POST",
      url: "/auth/signIn/",
      handler: signInRoute,
    });
};
