import { createServerFn } from "@tanstack/react-start";
import { marketQuery } from "./pakistan-pharmacy.ts";
import { lookupPakistanMarket } from "./pakistan-pharmacy.server.ts";
import { detectIdentifiers } from "./safety.ts";

export const searchPakistanMarket = createServerFn({ method: "POST" })
  .validator((input: { query: string }) => {
    if (
      typeof input?.query !== "string" ||
      input.query.length > 100 ||
      detectIdentifiers(input.query)
    ) {
      throw new Error("Enter a medicine or product name");
    }
    const query = marketQuery(input.query);
    if (query.length < 3) throw new Error("Enter at least three characters");
    return { query };
  })
  .handler(({ data }) => lookupPakistanMarket(data.query));
