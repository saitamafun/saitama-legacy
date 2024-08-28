"use client";

import clsx from "clsx";
import { string } from "yup";

import {
  type AuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "@firebase/auth";

import { useEffect, useMemo, useState } from "react";

import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";

import { ErrorMessage, Field, Form, Formik } from "formik";

import type { PreEvent, Api } from "../../lib";
import { Firebase } from "../../lib/firebase";
import { sendMessage, type SaitamaURLParams } from "../../lib/web3/utils";

import { useExma } from "../../composables/useExma";
import useParams from "../../composables/useParams";
import usePolyfillCookie from "../../composables/usePolyfillCookie";
import { emailSignInFormValidationSchema } from "../../forms/EmailForm";
import {
  processAnonymousAuthenticate,
  processAuthenticate,
  processEmailSignInForm,
} from "../../actions";

import LoginSuccess from "../LoginSuccess";

import ProtectedTradeMark from "../ProtectedTradeMark";

import AlertDialog from "./AlertDialog";
import ConfirmEmailDialog from "./ConfirmEmailDialog";

type LoginDialogProps = {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

type PropsWithApi = {
  api: Api;
};

export function LoginDialog({ open, setOpen }: LoginDialogProps) {
  const { api, setUser } = useExma();
  const [, setCookie] = usePolyfillCookie(["accessToken"]);
  const { customLoginMethods } = useParams();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onPopupSignIn = async (provider: AuthProvider) => {
    setIsSubmitting(true);

    return signInWithPopup(Firebase.instance.auth, provider)
      .then(async ({ user }) => {
        const idToken = await user.getIdToken();
        await processAuthenticate(idToken, api.baseURL, api.token).then(
          ({ user, token }) => {
            setUser(user);
            setCookie("accessToken", token);
            setIsLoggedIn(true);
          }
        );
      })

      .finally(() => setIsSubmitting(false));
  };

  const onCustomSignIn = async (id: string, provider: string) => {
    processAnonymousAuthenticate(id, provider, api.baseURL, api.token)
      .then(({ user, token }) => {
        setUser(user);
        setCookie("accessToken", token);
        setIsLoggedIn(true);
      })
      .finally(() => setIsSubmitting(false));
  };

  useEffect(() => {
    sendMessage("wallet", { status: "authenticating" });
  }, []);

  return (
    <AlertDialog
      open={open}
      setOpen={setOpen}
      title="Log in or sign up"
    >
      {isLoggedIn ? (
        <LoginSuccess
          show={isLoggedIn}
          setShow={(state) => {
            open = typeof state === "function" ? state(open!) : state;
            if (setOpen) setOpen(open);
            else sendMessage("modal", { open });
          }}
        />
      ) : (
        <section className="flex-1 flex flex-col space-y-4">
          <EmailSignIn api={api} />
          <div className="flex flex-col space-y-2">
            <GoogleSignIn
              isSubmitting={isSubmitting}
              onPopupSignIn={onPopupSignIn}
            />
            <GithubSignIn
              isSubmitting={isSubmitting}
              onPopupSignIn={onPopupSignIn}
            />
            {customLoginMethods &&
              customLoginMethods.map((data, index) => (
                <CustomSignIn
                  key={index}
                  data={data}
                  isSubmitting={isSubmitting}
                  onSignIn={(payload) =>
                    onCustomSignIn(payload.id, payload.provider)
                  }
                />
              ))}
          </div>
        </section>
      )}
      <footer className="flex flex-col space-y-2 py-4 text-xs text-black/75 text-center dark:text-white/75">
        {!isLoggedIn && (
          <div className="self-center">
            <p>
              By logging in I agree to the <b>Terms</b> &<b> Privacy Policy</b>
            </p>
          </div>
        )}
        <ProtectedTradeMark />
      </footer>
    </AlertDialog>
  );
}

type SignInButton = {
  isSubmitting: boolean;
  onPopupSignIn: (provider: AuthProvider) => Promise<void>;
};

function GoogleSignIn({ isSubmitting, onPopupSignIn }: SignInButton) {
  const [isLoading, setIsLoading] = useState(false);
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  return (
    <button
      disabled={isSubmitting}
      className="flex items-center space-x-2 p-2  border border-black/20 rounded-md dark:bg-dark"
      onClick={() => {
        setIsLoading(true);
        onPopupSignIn(provider).finally(() => setIsLoading(false));
      }}
    >
      <FcGoogle className="text-xl" />
      <p className="flex-1 text-center">Continue with Google</p>
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}

function GithubSignIn({ isSubmitting, onPopupSignIn }: SignInButton) {
  const [isLoading, setIsLoading] = useState(false);
  const provider = useMemo(() => new GithubAuthProvider(), []);

  return (
    <button
      disabled={isSubmitting}
      className="flex items-center space-x-2 border border-black/20  p-2 rounded-md dark:bg-dark"
      onClick={() => {
        setIsLoading(true);
        onPopupSignIn(provider).finally(() => setIsLoading(false));
      }}
    >
      <BsGithub className="text-xl" />
      <p className="flex-1 text-center"> Continue with Github</p>
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}

type CustomSignInProps = {
  data: NonNullable<SaitamaURLParams["customLoginMethods"]>[number];
  isSubmitting: boolean;
  onSignIn: (
    data: PreEvent.AuthenticateUserEvent["data"]["payload"] & {
      provider: string;
    }
  ) => Promise<void>;
};

function CustomSignIn({
  data: { provider, logo },
  isSubmitting,
  onSignIn,
}: CustomSignInProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onMessage = ({
    data: { event, data },
  }: MessageEvent<PreEvent.Event>) => {
    switch (event) {
      case "authentication.user":
        if (data.provider === provider)
          return onSignIn(Object.assign(data.payload, { provider })).finally(
            () => setIsLoading(false)
          );
    }
  };

  useEffect(() => {
    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, [provider]);

  return (
    provider && (
      <button
        disabled={isSubmitting}
        className="flex items-center space-x-2 border border-black/20  p-2 rounded-md dark:bg-dark"
        onClick={() => {
          setIsLoading(true);
          sendMessage("authentication.initialize", { provider });
        }}
      >
        {logo && (
          <img
            src={logo}
            width={128}
            height={128}
            className="w-6 h-6 rounded-full object-cover"
          />
        )}
        <p className="flex-1 text-center">
          Continue with <span className="capitalize">{provider}</span>
        </p>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
      </button>
    )
  );
}

function EmailSignIn({ api }: PropsWithApi) {
  const [email, setEmail] = useState<string | null>(null);
  const [canConfirmEmail, setCanConfirmEmail] = useState(false);

  return (
    <>
      <Formik
        initialValues={{ email: "", isEmailValid: false }}
        validationSchema={emailSignInFormValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          processEmailSignInForm(values, api.baseURL, api.token)
            .then(() => setCanConfirmEmail(true))
            .finally(() => setSubmitting(false));
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <div>
              <div className="flex items-center space-x-2 border border-black/20 px-2 rounded-md input dark:border-dark-100">
                <MdOutlineEmail className="text-xl text-black/50 dark:text-white/30" />
                <Field
                  name="email"
                  className="flex-1 py-3 placeholder-black/50 outline-none bg-transparent focus:outline-none dark:placeholder-white/30"
                  placeholder="your@email.com"
                  onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = event.currentTarget.value;
                    setEmail(value);
                    setFieldValue(
                      "isEmailValid",
                      string().email().isValidSync(value)
                    );
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={clsx(
                    values.isEmailValid
                      ? "text-black dark:text-white"
                      : "text-black/50 dark:text-white/30"
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
              <small className="text-red-500 capitalize dark:text-red">
                <ErrorMessage name="email" />
              </small>
            </div>
          </Form>
        )}
      </Formik>
      {email && (
        <ConfirmEmailDialog
          email={email}
          open={canConfirmEmail}
          setOpen={setCanConfirmEmail}
        />
      )}
    </>
  );
}
