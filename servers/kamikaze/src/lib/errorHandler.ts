import { ZodError } from "zod";
import { DrizzleError } from "drizzle-orm";
import type { FastifyReply } from "fastify";
import postgres from "postgres";

export const requestErrorHandler =
  <T extends any>(reply: FastifyReply) =>
  (error: T) => {
    console.error(error);
    if (error instanceof ZodError) {
      return reply.status(400).send(error.format());
    } else if (error instanceof DrizzleError) {
      return reply.status(500).send(error.message);
    } else if (error instanceof postgres.PostgresError) {
      return reply.status(500).send({ message: error.detail });
    }

    return Promise.reject(error);
  };
