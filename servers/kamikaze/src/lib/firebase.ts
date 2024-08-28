import { Auth, getAuth } from "firebase-admin/auth";

export class Firebase {
  readonly auth: Auth;

  constructor() {
    this.auth = getAuth();
  }

  verifyIdToken(idToken: string) {
    return this.auth.verifyIdToken(idToken);
  }

  async createUser({ email }: { email: string }) {
    let firebaseUser = await Firebase.instance.auth
      .getUserByEmail(email)
      .catch(() => null);

    if (firebaseUser) return firebaseUser;

    return Firebase.instance.auth.createUser({
      email,
      emailVerified: false,
    });
  }

  static #instance: Firebase;

  static get instance() {
    if (!Firebase.#instance) Firebase.#instance = new Firebase();
    return Firebase.#instance;
  }
}
