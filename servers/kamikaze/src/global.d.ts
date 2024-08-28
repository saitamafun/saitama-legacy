import { z } from "zod";
import type { Server } from "socket.io";
import { type Account, type PublicKey } from "@metaplex-foundation/umi";
import type {
  JsonMetadata,
  MetadataAccountData,
} from "@metaplex-foundation/mpl-token-metadata";

import type {
  selectAppSchema,
  selectAuthUserSchema,
  selectUserSchema,
} from "./db/zod";

type User = z.infer<typeof selectUserSchema> &
  z.infer<typeof selectAuthUserSchema>;

declare module "fastify" {
  interface PassportUser extends User {
    app?: z.infer<typeof selectAppSchema> | null;
  }

  interface FastifyInstance {
    io: Server;
  }
}

declare module "@fastify/secure-session" {
  interface SessionData {
    ["app/jwt"]: string;
  }
}

declare module "@metaplex-foundation/mpl-token-metadata" {
  type Metadata = Account<MetadataAccountData> & {
    json: JsonMetadata | null;
  };

  type DigitalAsset = {
    mint: {
      publicKey: PublicKey;
    };
    metadata: Metadata;
  };
}
