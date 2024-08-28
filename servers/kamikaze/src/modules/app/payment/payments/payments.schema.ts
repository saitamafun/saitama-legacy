import { insertPaymentSchema, selectPaymentSchema } from "@/db/zod";

export const initializePaymentSchema = insertPaymentSchema.omit({
  isVerified: true,
  signature: true,
});

export const secureUpdateSchema = insertPaymentSchema.pick({
  signature: true,
});

export const securePaymentSchema = selectPaymentSchema.omit({ wallet: true });
