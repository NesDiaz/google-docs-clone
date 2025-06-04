import { parseAsString, useQueryState } from "nuqs";

export function useSearchParam() {
    return useQueryState(
        "Search",
        parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    );
};
