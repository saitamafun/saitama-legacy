import { readFileSync } from "fs";
import firebaseAdmin from "firebase-admin";

import { Strategy } from "passport-jwt";
import { Strategy as CustomStrategy } from "passport-custom";

import fastifyCors from "@fastify/cors";
import fastifyPassport from "@fastify/passport";
import fastifySocketIO from "fastify-socket.io";
import fastifySecureSession from "@fastify/secure-session";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";

import { FIREBASE_SERVICE_ACCOUNT, SECRET_KEY } from "./config";
import { getUserById } from "./modules/user/user.controller";
import { getApiKeyByPublicKey } from "./modules/app/apiKeys/apiKeys.controller";
import { getAuthUserById } from "./modules/app/auth/authUsers/authUsers.controller";
import {
  registerAuthRoutes,
  registerUsersRoutes,
  registerWalletsRoutes,
  registerWebhooksRoutes,
  registerPaymentsRoutes,
  registerAppsRoutes,
  registerAuthUsersRoutes,
  registerApiKeyRoutes,
} from "./modules";
import { registerRpcRoute } from "./modules/app/auth/rpc/rpc.route";
import { registerEmbeddedWalletRoute } from "./modules/app/auth/embeddedWallets/embeddedWallets.route";
import fastifyCookie from "@fastify/cookie";

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    JSON.parse(FIREBASE_SERVICE_ACCOUNT)
  ),
});

const extractJwtFromCookiesOrAsBearerToken =
  (cookieName: string) => (request: FastifyRequest) => {
    const signedToken = request.cookies[cookieName]!;
    if (signedToken) {
      const token = request.unsignCookie(signedToken);
      console.log(token);
      if (token.valid) return token.value;
    }
    const authorization = request.headers.authorization;
    if (authorization) {
      const [, token] = authorization.split(/\s/);
      return token;
    }

    return null;
  };

const registerRoutes = (app: FastifyInstance) => {
  registerAuthRoutes(app);
  registerUsersRoutes(app);
  registerAppsRoutes(app);
  registerApiKeyRoutes(app);
  registerWalletsRoutes(app);
  registerWebhooksRoutes(app);
  registerPaymentsRoutes(app);
  registerAuthUsersRoutes(app);
  registerEmbeddedWalletRoute(app);
  registerRpcRoute(app);
};

const createFastifyInstance = () => {
  const fastify = Fastify({
    logger: true,
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
  });

  fastify.register(fastifyCookie, {
    secret: SECRET_KEY,
    parseOptions: {
      sameSite: "none",
      secure: true,
      signed: true,
      httpOnly: true,
      path: "/",
    },
  });
  fastify.register(fastifyCors, {
    origin: [/\.saitama\.fun$/, /\.tekfinance\.fun$/, /localhost/],
    credentials: true,
  });
  fastify.register(fastifySecureSession, {
    key: readFileSync("secret-key"),
  });
  fastify.register(fastifyPassport.initialize());
  fastify.register(fastifyPassport.secureSession());

  fastify.register(fastifySocketIO, { cors: { origin: "*" } });

  fastifyPassport.use(
    "jwt",
    new Strategy(
      {
        jwtFromRequest: extractJwtFromCookiesOrAsBearerToken("jwt"),
        secretOrKey: SECRET_KEY,
      },
      async (payload, done) => {
        if (payload.id)
          return await getUserById(payload.id)
            .then((user) => done(null, user))
            .catch((err) => done(err, null));
        return done(null, null);
      }
    )
  );

  fastifyPassport.use(
    "app/token",
    new CustomStrategy(async (req, done) => {
      const authorization = req.headers.authorization;

      if (authorization) {
        const [, token] = authorization.split(/\s/);
        if (token) {
          const apiKey = await getApiKeyByPublicKey(token);
          if (apiKey)
            return done(null, { ...apiKey.app.user, app: apiKey.app });
        }
      }

      return done(null, null);
    })
  );

  fastifyPassport.use(
    "app/jwt",
    new Strategy(
      {
        jwtFromRequest: extractJwtFromCookiesOrAsBearerToken("app/jwt"),
        secretOrKey: SECRET_KEY,
      },
      async (payload, done) => {
        if (payload.userId)
          return await getAuthUserById(payload.userId)
            .then((user) => done(null, user))
            .catch((err) => done(err, null));
        return done(null, null);
      }
    )
  );

  fastifyPassport.registerUserSerializer(async (user) => user);
  fastifyPassport.registerUserDeserializer(async (user) => user);

  return fastify;
};

async function main() {
  const fastify = createFastifyInstance();

  registerRoutes(fastify);

  const tasks: Promise<any>[] = [];

  tasks.push(
    fastify.listen({ port: Number(process.env.PORT!), host: process.env.HOST! })
  );

  await Promise.all(tasks);
}

main().catch(console.log);
