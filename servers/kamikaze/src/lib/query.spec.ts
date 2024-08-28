import { apps } from "../db/schema";
import { createQuerySchema, queryBuilder } from "./query";

function main() {
  const query = queryBuilder(apps, {
    createdAt: () => apps.createdAt,
    name: apps.name,
  });
  console.log(query.columns.createdAt);
  console.log(query({ createdAt: "2022-1-20", name: "ksksksk" }));

  const a = createQuerySchema(query)
a.parseAsync({}).then(body => body)
}

main();
