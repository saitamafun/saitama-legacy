import {
  and,
  Column,
  eq,
  gt,
  gte,
  like,
  lt,
  lte,
  ne,
  or,
  SQL,
  Table,
} from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

export const Grammer = {
  eq,
  lt,
  lte,
  gt,
  gte,
  like,
  ne,
};

export const mapFilters = function <T extends Column>(
  column: T,
  filters: string[],
  value: any
) {
  const queries: SQL[] = [];

  if (filters.length === 0) return eq(column, value);

  for (const filter of filters) {
    if (filter in Grammer) {
      const grammer = Grammer[filter as unknown as keyof typeof Grammer](
        column,
        value
      );
      queries.push(grammer);
    } else {
      queries.push(eq(column, value));
    }
  }

  if (queries.length > 0) return or(...queries);
  return queries.at(0);
};

export type QueryBuilder<T> = {
  [key in keyof T]: ((column: T) => T[key]) | T[key];
};

export const queryBuilder = function <
  TTable extends Table,
  TRefine = Partial<TTable["_"]["columns"]>
>(table: TTable, builder: QueryBuilder<TRefine & Record<string, any>>) {
  const onQuery = (query: Partial<Record<keyof TRefine, any>>) => {
    const sqlWrappers: (SQL | undefined)[] = [];

    for (const [key, value] of Object.entries(query)) {
      const [query, ...filters] = key.split("__");
      if (query in builder) {
        const column = builder[query as keyof TRefine];
        const resolveColumn =
          typeof column === "function" ? column(table) : column;
        const results = mapFilters(resolveColumn, filters, value);
        sqlWrappers.push(results);
      }
    }
    if (sqlWrappers.length > 0) return and(...sqlWrappers);

    return sqlWrappers.at(0);
  };

  onQuery.table = table;
  onQuery.columns = Object.fromEntries(
    Object.entries(builder).map(([key, value]) => {
      const column = typeof value === "function" ? value(table as any) : value;
      return [key, column];
    })
  ) as {
    [key in keyof TRefine]: TRefine[key] extends (
      column: TTable
    ) => TRefine[key]
      ? ReturnType<TRefine[key]>
      : TRefine[key];
  };

  return onQuery;
};

export const createQuerySchema = <
  TTable extends Table,
  TRefine extends Partial<TTable["_"]["columns"]>
>(
  builder: ReturnType<typeof queryBuilder<TTable, TRefine>>
) => {
  const pick = Object.fromEntries(
    Object.keys(builder.columns).map((key) => [key, true])
  ) as { [key in keyof typeof builder.columns]: never };

  return createSelectSchema(builder.table).pick(pick);
};
