import { ApiImpl } from "./impl";
import type { User } from "./models/user.model";

export class UserApi extends ApiImpl {
  path = "/apps/auth/users/";

  get(id: string) {
    return this.xior.get<User>(this.buildPath(id));
  }

  update<T extends Record<string, any>>(id: string, data: T) {
    return this.xior.patch<User>(this.buildPath(id), data);
  }

  delete(id: string) {
    return this.xior.delete<User>(this.buildPath(id));
  }
}
