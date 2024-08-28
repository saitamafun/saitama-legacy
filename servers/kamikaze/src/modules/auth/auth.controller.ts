import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { Application } from "@/singleton";

import { users } from "@/db/schema";

export const authenticateWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const user = await Application.instance.db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (user && (await bcrypt.compare(password, user.password))) return user;

  return null;
};
