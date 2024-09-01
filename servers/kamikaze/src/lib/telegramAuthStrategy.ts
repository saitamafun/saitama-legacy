import passportCustom, { type VerifiedCallback } from "passport-custom";
import {
  type InitDataParsed,
  parse,
  validate,
} from "@telegram-apps/init-data-node";

export const TelegramAuthenticationStrategy = (
  authToken: string,
  verify: (payload: NonNullable<InitDataParsed>, done: VerifiedCallback) => void
) =>
  new passportCustom.Strategy(async (req, next) => {
    if (req.headers.authorization) {
      const [flag, authData] = req.headers.authorization.split(" ");
      switch (flag) {
        case "tma":
          return next(verify(await validateAsync(authToken, authData), next));
        default:
          return next(new Error("Unauthorized"));
      }
    }
  });

export const validateAsync = async (accessToken: string, initDataRaw: string) =>
  new Promise<InitDataParsed>((resolve, reject) => {
    try {
      validate(initDataRaw, accessToken);
      return resolve(parse(initDataRaw));
    } catch (error) {
      return reject(error);
    }
  });
