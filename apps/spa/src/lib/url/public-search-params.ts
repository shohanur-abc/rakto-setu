import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
} from "nuqs"
import { bloodGroupValues, urgencyValues } from "@/lib/url/options"

export const publicSearchClientParsers = {
    bloodGroup: parseAsStringLiteral(bloodGroupValues),
    locationId: parseAsString,
    urgency: parseAsStringLiteral(urgencyValues),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(12),
}
