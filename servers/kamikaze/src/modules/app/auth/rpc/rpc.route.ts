import type { z } from "zod";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { getAllDigitalAsset, umi } from "@/lib/web3";
import { requestErrorHandler } from "@/lib/errorHandler";

import { mintSchema } from "../embeddedWallets/embededWallet.schema";

const getAllDigitalAssetRoute = (
  req: FastifyRequest<{ Body: z.infer<typeof mintSchema> }>
) =>
  mintSchema
    .parseAsync(req.body)
    .then(({ mints }) => getAllDigitalAsset(umi, mints))
    .catch(requestErrorHandler);

export const registerRpcRoute = (app: FastifyInstance) => {
  app.route({
    method: "POST",
    url: "/rpc/getAllDigitalAsset",
    handler: getAllDigitalAssetRoute,
  });
};
