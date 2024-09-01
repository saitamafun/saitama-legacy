import type { z } from "zod";
import jsonwebtoken from "jsonwebtoken";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { SECRET_KEY, TELEGRAM_ACCESS_TOKEN } from "@/config";
import { Firebase } from "@/lib/firebase";
import { generateRandomInt } from "@/lib/utils";
import { requestErrorHandler } from "@/lib/errorHandler";
import { validateAsync } from "@/lib/telegramAuthStrategy";
import {
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "@/lib/pagination";
import { insertAuthUserSchema, selectAuthUserById } from "@/db/zod";

import {
  confirmVerificationDataByUId,
  createOrReturnAuthUser,
  deleteAuthUserByAppAndId,
  getAuthUserByAppAndId,
  getAuthUsersByApp,
  updateAuthUserByAppAndId,
} from "./authUsers.controller";
import {
  authUsersAuthenticationSchema,
  emailAuthenticationSchema,
  emailVerificationSchema,
  safeAuthUserSchema,
  telegramAuthenticationSchema,
} from "./authUsers.schema";

const authenticateRoute = async (
  req: FastifyRequest<{ Body: z.infer<typeof authUsersAuthenticationSchema> }>,
  reply: FastifyReply
) => {
  return authUsersAuthenticationSchema
    .parseAsync(req.body)
    .then(async ({ idToken }) => {
      const firebaseUser = await Firebase.instance.verifyIdToken(idToken);
      const user = await createOrReturnAuthUser(
        req.user!.id,
        req.user!.app!.id,
        {
          email: firebaseUser.email,
          lastLogin: new Date(firebaseUser.auth_time),
          uid: firebaseUser.uid,
          provider: firebaseUser.firebase.sign_in_provider, /// To deny custom users from using this route
        }
      );

      if (user) {
        const token = jsonwebtoken.sign(
          { userId: user.id, appId: req.user!.app!.id, isVerified: true },
          SECRET_KEY
        );

        req.session.set("app/jwt", token);

        return reply
          .setCookie("app/jwt", token, { path: "/", httpOnly: true })
          .send({
            token,
            user: await safeAuthUserSchema.parseAsync(user),
          });
      }

      return reply.status(403).send({
        message: "Unauthorized app or user",
      });
    })
    .catch(requestErrorHandler(reply));
};

const getAuthUsersRoute = (
  req: FastifyRequest<{
    Querystring: z.infer<typeof limitOffsetPaginationSchema>;
  }>,
  reply: FastifyReply
) =>
  limitOffsetPaginationSchema
    .parseAsync(req.query)
    .then(async ({ limit, offset }) => {
      const paginator = new LimitOffsetPagination(limit, offset);
      return paginator.getResponse(
        await getAuthUsersByApp(
          req.user!.app!.id,
          paginator.limit,
          paginator.getOffset()
        )
      );
    })
    .catch(requestErrorHandler(reply));

const getAuthUserRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectAuthUserById> }>,
  reply: FastifyReply
) =>
  req.params.id === "me"
    ? req.user
    : selectAuthUserById
        .parseAsync(req.params)
        .then(async ({ id }) => {
          const user = await getAuthUserByAppAndId(req.user!.app!.id, id);
          if (user.length > 0) return user.at(0);

          return reply.status(403).send({
            message: "User not found",
          });
        })
        .catch(requestErrorHandler(reply));

const updateAuthUserRoute = (
  req: FastifyRequest<{
    Params: z.infer<typeof selectAuthUserById>;
    Body: z.infer<typeof insertAuthUserSchema>;
  }>,
  reply: FastifyReply
) =>
  selectAuthUserById
    .parseAsync(req.params)
    .then(({ id }) =>
      insertAuthUserSchema
        .partial()
        .parseAsync(req.body)
        .then(async (body) => {
          const authUsers = await updateAuthUserByAppAndId(
            req.user!.app!.id,
            id,
            body
          );

          if (authUsers.length > 0) return authUsers.at(0);

          return reply.status(404).send({
            message: "User not found",
          });
        })
    )
    .catch(requestErrorHandler(reply));

const deleteAuthUserRoute = (
  req: FastifyRequest<{ Params: z.infer<typeof selectAuthUserById> }>,
  reply: FastifyReply
) =>
  selectAuthUserById
    .parseAsync(req.params)
    .then(async ({ id }) => {
      const authUsers = await deleteAuthUserByAppAndId(req.user!.app!.id, id);

      if (authUsers.length > 0) return authUsers.at(0);

      return reply.status(404).send({
        message: "User not found",
      });
    })
    .catch(requestErrorHandler(reply));

const emailSignInRoute = (req: FastifyRequest, reply: FastifyReply) =>
  emailAuthenticationSchema
    .parseAsync(req.body)
    .then(async (body) => {
      const verificationData = {
        ttl: Date.now() * (1000 * 60 * 5),
        code: generateRandomInt(6).toString(),
      };
      console.log(verificationData);
      const firebaseUser = await Firebase.instance.createUser({
        email: body.email!,
      });

      const authUser = await createOrReturnAuthUser(
        req.user!.id,
        req.user!.app!.id,
        {
          ...body,
          verificationData,
          uid: firebaseUser.uid,
          provider: "email+otp",
        }
      );

      if (authUser) return authUser;

      return reply.status(403).send({
        message: "Unauthorized app or user",
      });
    })
    .catch(requestErrorHandler(reply));

const emailVerificationRoute = async (
  req: FastifyRequest<{ Body: z.infer<typeof emailVerificationSchema> }>,
  reply: FastifyReply
) =>
  emailVerificationSchema
    .parseAsync(req.body)
    .then(async ({ email, ...body }) => {
      const firebaseUser = await Firebase.instance.auth.getUserByEmail(email);
      const user = await confirmVerificationDataByUId(
        req.user!.app!.id,
        firebaseUser.uid,
        body
      );

      if (user) {
        const token = jsonwebtoken.sign(
          { userId: user.id, appId: req.user!.app!.id, isVerified: true },
          SECRET_KEY
        );

        req.session.set("app/jwt", token);

        return reply.cookie("app/jwt", token).send({
          token,
          user: await safeAuthUserSchema.parseAsync(user),
        });
      }

      return reply.status(404).send({
        message: "Invalid verification code",
      });
    })
    .catch(requestErrorHandler(reply));

const telegramAuthenticationRoute = async (
  req: FastifyRequest<{ Body: z.infer<typeof telegramAuthenticationSchema> }>,
  reply: FastifyReply
) =>
  telegramAuthenticationSchema
    .parseAsync(req.body)
    .then(async ({ initDataRaw }) => {
      const parsedInitData = await validateAsync(
        TELEGRAM_ACCESS_TOKEN,
        initDataRaw
      );
      const user = await createOrReturnAuthUser(
        req.user!.id,
        req.user!.app!.id,
        {
          uid: String(parsedInitData.user!.id),
          provider: "telegram",
        }
      );
      if (user) {
        const token = jsonwebtoken.sign(
          { userId: user.id, appId: req.user!.app!.id, isVerified: true },
          SECRET_KEY
        );

        req.session.set("app/jwt", token);

        return reply
          .setCookie("app/jwt", token, { path: "/", httpOnly: true })
          .send({
            token,
            user: await safeAuthUserSchema.parseAsync(user),
          });
      }

      return reply.status(403).send({
        message: "Unauthorized app or user",
      });
    })
    .catch(requestErrorHandler(reply));

/**
 *
 * @param req
 * @param reply
 *
 * used in context of bots or custom authentication by client
 */
const createAnonymousUser = (req: FastifyRequest, reply: FastifyReply) =>
  insertAuthUserSchema
    .parseAsync(req.body)
    .then((body) =>
      createOrReturnAuthUser(req.user!.id, req.user!.app!.id, body)
    )
    .then(async (user) => {
      if (user) {
        const token = jsonwebtoken.sign(
          { userId: user.id, appId: req.user!.app!.id, isVerified: true },
          SECRET_KEY
        );

        req.session.set("app/jwt", token);

        return reply.cookie("app/jwt", token).send({
          token,
          user,
        });
      }
    })
    .catch(requestErrorHandler(reply));

export const registerAuthUsersRoutes = (app: FastifyInstance) => {
  app
    .route({
      method: "POST",
      url: "/apps/auth/authenticate/",
      preHandler: passport.authenticate(["jwt", "app/token"]),
      handler: authenticateRoute,
    })
    .route({
      method: "POST",
      url: "/apps/auth/anonymous/",
      preHandler: passport.authenticate(["app/token"]),
      handler: createAnonymousUser,
    })
    .route({
      method: "POST",
      url: "/apps/auth/telegram/",
      preHandler: passport.authenticate(["app/token"]),
      handler: telegramAuthenticationRoute,
    })
    .route({
      method: "POST",
      url: "/apps/auth/email/",
      preHandler: passport.authenticate(["app/token"]),
      handler: emailSignInRoute,
    })
    .route({
      method: "POST",
      url: "/apps/auth/email/_verify/",
      preHandler: passport.authenticate(["app/token"]),
      handler: emailVerificationRoute,
    })
    .route({
      method: "GET",
      url: "/apps/auth/users/",
      preHandler: passport.authenticate(["jwt", "app/jwt"]),
      handler: getAuthUsersRoute,
    })
    .route({
      method: "GET",
      url: "/apps/auth/users/:id/",
      preHandler: passport.authenticate(["app/jwt"]),
      handler: getAuthUserRoute,
    })
    .route({
      method: "PATCH",
      url: "/apps/auth/users/:id/",
      preHandler: passport.authenticate(["app/jwt"]),
      handler: updateAuthUserRoute,
    })
    .route({
      method: "DELETE",
      url: "/apps/auth/users/:id/",
      preHandler: passport.authenticate(["jwt", "app/jwt"]),
      handler: deleteAuthUserRoute,
    });
};
