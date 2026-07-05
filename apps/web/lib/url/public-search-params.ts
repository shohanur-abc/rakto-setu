import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
} from "nuqs/server"
import { bloodGroupValues, urgencyValues } from "@/lib/url/options"

export const publicSearchParsers = {
    bloodGroup: parseAsStringLiteral(bloodGroupValues),
    locationId: parseAsString,
    urgency: parseAsStringLiteral(urgencyValues),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(12),
}

export const publicSearchParamsCache =
    createSearchParamsCache(publicSearchParsers)
