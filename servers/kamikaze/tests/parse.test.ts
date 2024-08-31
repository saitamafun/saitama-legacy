import crypto from "crypto";
import { TELEGRAM_ACCESS_TOKEN } from "@/config";
import { parse, sign, signData, validate } from "@telegram-apps/init-data-node";

const data = parse(
  decodeURIComponent(
    "query_id%3DAAFq8ExpAgAAAGrwTGmOqt6C%26user%3D%257B%2522id%2522%253A6061617258%252C%2522first_name%2522%253A%2522%25E9%25AC%25BC%25E3%2582%25B5%25E3%2582%25A4%25E3%2583%259C%25E3%2583%25BC%25E3%2582%25B0%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522onisaibogu%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1725114690%26hash%3Dcfeaf8a5ebed2f597456f172aedb7191faa1761817dd14e569b0f93d4de58314"
  )
);

// console.log(data);

const q = new URLSearchParams([
  ["query_id", data.queryId!],
  ["user", JSON.stringify(data.user)],
  ["auth_date", data.authDate.getSeconds().toString()],
  ["hash", data.hash],
]).toString();

console.log(signData(q, TELEGRAM_ACCESS_TOKEN));

// console.log(validate(data, TELEGRAM_ACCESS_TOKEN, { expiresIn: 0 }));
