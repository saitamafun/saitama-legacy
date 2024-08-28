import { useContext } from "react";
import { ApiContext } from "../providers/ApiProvider";

export const useApi = () => {
  const { api } = useContext(ApiContext);
  if (api) return api;

  throw new Error(
    "Make sure you are calling this function as a child of <ApiProvider/>"
  );
};
