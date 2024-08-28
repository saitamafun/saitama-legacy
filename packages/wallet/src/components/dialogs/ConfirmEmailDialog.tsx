"use client";

import { Form, Formik } from "formik";

import { useState } from "react";
import { MdEmail } from "react-icons/md";

import OTPInput from "react-otp-input";

import { processOTPForm } from "../../actions";
import { useExma } from "../../composables";
import { validateOTPSchema } from "../../forms/OTPForm";
import usePolyfillCookie from "../../composables/usePolyfillCookie";

import LoginSuccess from "../LoginSuccess";
import ProtectedTradeMark from "../ProtectedTradeMark";

import AlertOverlayDialog from "./AlertOverlayDialog";

type ConfirmEmailDialogProps = {
  email: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ConfirmEmailDialog({
  email,
  open,
  setOpen,
}: ConfirmEmailDialogProps) {
  const { api, setUser } = useExma();
  const [, setCookie] = usePolyfillCookie(["accessToken"]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AlertOverlayDialog
      open={open}
      setOpen={setOpen}
      title="Log in or Sign up"
    >
      {!isLoggedIn && (
        <section className="flex-1 flex flex-col space-y-8">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="bg-black text-white p-3 rounded-full dark:bg-white dark:text-black">
              <MdEmail className="text-2xl grid-cols-6" />
            </div>
            <h1 className="text-lg font-medium">Enter confirmation code</h1>
            <p>
              Please check <b>{email}</b> for an email from saitama.fun and
              enter your code below.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Formik
              initialValues={{ otp: "" }}
              validationSchema={validateOTPSchema}
              onSubmit={() => void 0}
            >
              {({ values, isSubmitting, setFieldValue, setSubmitting }) => (
                <Form className="flex flex-col space-y-2">
                  <OTPInput
                    value={values.otp}
                    numInputs={6}
                    onChange={async (value) => {
                      setFieldValue("otp", value);

                      if (value.trim().length >= 6) {
                        setSubmitting(true);

                        processOTPForm(
                          {
                            email,
                            code: value,
                          },
                          api.baseURL,
                          api.token
                        )
                          .then(({ user, token }) => {
                            setUser(user);
                            setCookie("accessToken", token);
                            setIsLoggedIn(true);
                          })
                          .finally(() => setSubmitting(false));
                      }
                    }}
                    inputType="tel"
                    containerStyle={{
                      display: "flex",
                      gap: 8,
                    }}
                    renderInput={(props) => (
                      <input
                        {...props}
                        disabled={isSubmitting}
                        className="flex-1 bg-black/5 text-xl h-14 rounded-md focus:outline-none focus:dark:ring-3 focus:ring-black focus:dark:ring-offset-1 focus:border focus:border-black dark:bg-dark-300 focus:dark:ring-white focus:dark:border-white focus:dark:ring-offset-dark"
                      />
                    )}
                  />
                  {isSubmitting && (
                    <div className="self-center w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent" />
                  )}
                </Form>
              )}
            </Formik>
            <div className="flex space-x-2">
              <p>Didn't get an email?</p>
              <button
                className="text-black underline dark:text-white"
                onClick={() => {}}
              >
                Resend code
              </button>
            </div>
          </div>
        </section>
      )}
      <LoginSuccess
        show={isLoggedIn}
        setShow={setOpen}
      />
      <footer className="flex flex-col items-center justify-center text-center p-4">
        <ProtectedTradeMark />
      </footer>
    </AlertOverlayDialog>
  );
}
