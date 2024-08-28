import { z } from "zod";
import { checkedConcatQueryString } from "./utils";

export const limitOffsetPaginationSchema = z.object({
  limit: z.any().optional(),
  offset: z.any().optional(),
});

export class LimitOffsetPagination {
  static LIMIT = 16;
  static OFFSET = 0;

  readonly limit: number;
  private readonly offset: number;

  constructor(private readonly url: URL, limit?: number, offset?: number) {
    this.limit = limit ?? LimitOffsetPagination.LIMIT;
    this.offset = offset ?? LimitOffsetPagination.OFFSET;
  }

  nextURL() {
    const q = new URLSearchParams();
    q.append("limit", this.limit.toString());
    q.append("offset", (this.getOffset() + this.limit).toString());

    return checkedConcatQueryString(this.url, q);
  }

  previousURL() {
    const q = new URLSearchParams();
    q.append("limit", this.limit.toString());
    q.append("offset", this.getOffset().toString());
    return checkedConcatQueryString(this.url, q);
  }

  getResponse<T>(results: T[]) {
    return {
      next: results.length > this.limit ? this.nextURL() : null,
      previous: this.offset > 0 ? this.previousURL() : null,
      results,
    };
  }

  getOffset() {
    return this.offset % this.limit > 0
      ? this.offset - (this.offset % this.limit)
      : this.offset;
  }
}
