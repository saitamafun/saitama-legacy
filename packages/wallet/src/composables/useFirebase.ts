import { useContext } from "react";
import { FirebaseContext } from "../providers/FirebaseProvider";

export function useFirebase() {
  return useContext(FirebaseContext);
}
