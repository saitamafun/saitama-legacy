import { ApiImpl } from "./impl";
import type { TokenWithUser } from "./models/token.model";

export class AuthApi extends ApiImpl {
  path = "/apps/auth/";

  authenticate(idToken: string) {
    return this.xior.post<TokenWithUser>(this.buildPath("authenticate"), {
      idToken,
    });
  }

  signInWithEmail(email: string) {
    return this.xior.post<{ success: boolean }>(this.buildPath("email"), {
      email,
    });
  }

  confirmVerificationCode(email: string, code: string) {
    return this.xior.post<TokenWithUser>(this.buildPath("email", "_verify"), {
      email,
      code,
    });
  }

  telegramAuthentication(tma: string) {
    return this.xior.post<TokenWithUser>(this.buildPath("telegram"), {
      initDataRaw: tma,
    });
  }

  /**
   *
   * @param uid
   * - {unsafe} use this only is know `uid` is unique
   */
  anonymousAuthentication(uid: string, provider?: string) {
    return this.xior.post<TokenWithUser>(this.buildPath("anonymous"), {
      uid,
      provider,
    });
  }
}
