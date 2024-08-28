import type { User } from "./user.model";

export type Token = {
  token: string;
};

export type TokenWithUser = Token & {
  user: User;
};
