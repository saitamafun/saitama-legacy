import { object, string } from "yup";

export type EmailSignInForm = {
  email: string;
};

export const emailSignInFormValidationSchema = object().shape({
  email: string().email().required(),
});
