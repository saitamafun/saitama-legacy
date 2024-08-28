"use server";

import cookie from "cookie";
import { Api, AuthUserApi } from "../lib";
import type { OTPForm } from "../forms/OTPForm";
import type { EmailSignInForm } from "../forms/EmailForm";

const tryNext = import("next/headers").catch(() => undefined);

const setCookies = async (cookies: string[]) => {
  const next = await tryNext;
  if (next)
    for (const serialized of cookies) {
      const [[key, value]] = Object.entries(cookie.parse(serialized));
      next.cookies().set(key, value, {
        httpOnly: true,
        secure: true,
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
};

export const processEmailSignInForm = async (
  { email }: EmailSignInForm,
  ...args: ConstructorParameters<typeof Api>
) => {
  const api = new Api(...args);

  const response = await api.auth.signInWithEmail(email);
  setCookies(response.headers.getSetCookie());
  return response.data;
};

export const processAuthenticate = async (
  idToken: string,
  ...args: ConstructorParameters<typeof Api>
) => {
  const api = new Api(...args);

  const response = await api.auth.authenticate(idToken);
  setCookies(response.headers.getSetCookie());

  return response.data;
};

export const processAnonymousAuthenticate = async (
  id: string,
  provider: string,
  ...args: ConstructorParameters<typeof Api>
) => {
  const api = new Api(...args);
  const response = await api.auth.anonymousAuthentication(id, provider);
  setCookies(response.headers.getSetCookie());

  return response.data;
};

export const processOTPForm = async (
  { email, code }: OTPForm,
  ...args: ConstructorParameters<typeof Api>
) => {
  const api = new Api(...args);
  const response = await api.auth.confirmVerificationCode(email, code);

  setCookies(response.headers.getSetCookie());
  return response.data;
};

export const processTransaction = async (
  walletid: string,
  transaction: number[],
  signers: Array<any>,
  rpcEndpoint: string,
  ...[baseURL, token, cookie]: ConstructorParameters<typeof AuthUserApi>
) => {
  const next = await tryNext;
  const api = new AuthUserApi(
    baseURL,
    token,
    next ? next.cookies().toString() : cookie
  );
  const response = await api.wallet.sendTransaction(
    walletid,
    transaction,
    signers,
    rpcEndpoint
  );
  setCookies(response.headers.getSetCookie());
  return response.data;
};
