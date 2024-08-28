import { initializeApp } from "@firebase/app";
import { type Auth, getAuth } from "@firebase/auth";

export class Firebase {
  private readonly app = initializeApp({
    apiKey: "AIzaSyB4wLCkKaIzEKPQcPz248X8dsPxiY2U1QI",
    authDomain: "saitama-kamikaze.firebaseapp.com",
    projectId: "saitama-kamikaze",
    storageBucket: "saitama-kamikaze.appspot.com",
    messagingSenderId: "1026859910741",
    appId: "1:1026859910741:web:bf7f0be31be9af3ccfb6dc",
    measurementId: "G-0QMGB318VQ",
  });

  public readonly auth: Auth;

  static #instance: Firebase;

  constructor() {
    this.auth = getAuth(this.app);
  }

  static get instance() {
    if (!Firebase.#instance) Firebase.#instance = new Firebase();

    return Firebase.#instance;
  }
}
