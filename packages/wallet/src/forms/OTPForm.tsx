import { object, string } from "yup";

export type OTPForm = {
  email: string;
  code: string;
};

export const validateOTPSchema = object().shape({
  otp: string().length(6).required(),
});
