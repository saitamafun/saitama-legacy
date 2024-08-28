import { useSearchParams } from "next/navigation";
import { decodeParams, type SaitamaURLParams } from "../lib/web3/utils";

export default function useParams(): SaitamaURLParams {
  const searchParams = useSearchParams();
  const hash = searchParams.get("hash");

  return hash ? decodeParams(hash) : Object.create(null);
}
