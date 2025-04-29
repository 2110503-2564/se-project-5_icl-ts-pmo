import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isProtectedPage } from "./utils";
import { checkBanAPI } from "./libs/api/auth";

export default function middleware(req: NextRequest) {
  if (isProtectedPage(req.nextUrl.pathname)) {
    return authMiddleware(req, { params: undefined });
  }
  return NextResponse.next();
}

const authMiddleware = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${req.nextUrl.href}&redirected=true`, req.nextUrl)
    );
  }
  if (!req.nextUrl.pathname.startsWith("/banIssue")) {
    const response = await checkBanAPI(req.auth);
    if (!response.success || response.isBanned) {
      return NextResponse.redirect(new URL(`/banIssue?redirected=true`, req.nextUrl));
    }
  }
  return NextResponse.next();
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
