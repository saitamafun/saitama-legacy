import { decrypt, encrypt } from "@/lib/secret"

export const main = function(){
  const hash =  encrypt({data: "unknown"})
  console.log(hash)
  console.log(decrypt(hash));
  
}

main()