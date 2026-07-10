import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, isLocale } from "@workspace/i18n"

const PUBLIC_FILE = /\.[^/]+$/

function preferredLocale(request: NextRequest) {
    const cookieLocale = request.cookies.get("rakto-setu.locale")?.value

    if (cookieLocale && isLocale(cookieLocale)) {
        return cookieLocale
    }

    const acceptedLanguage = request.headers
        .get("accept-language")
        ?.toLowerCase()

    return acceptedLanguage?.includes("bn") ? "bn" : defaultLocale
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        PUBLIC_FILE.test(pathname)
    ) {
        return
    }

    const firstSegment = pathname.split("/")[1] ?? ""

    if (isLocale(firstSegment)) {
        return
    }

    request.nextUrl.pathname = `/${preferredLocale(request)}${
        pathname === "/" ? "" : pathname
    }`

    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: ["/((?!_next|api|.*\\..*).*)"],
}
