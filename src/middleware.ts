import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isProtectedPage } from "./utils";
import { checkBanAPI } from "./libs/api/checkBan";

export default function middleware(req: NextRequest) {
  if (isProtectedPage(req.nextUrl.pathname)) {
    return authMiddleware(req, { params: undefined });
  }
  return NextResponse.next();
}

const authMiddleware = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${req.nextUrl.href}`, req.nextUrl));
  }
  if (!req.nextUrl.pathname.startsWith("/banIssue")) {
    const response = (await fetch(`${req.nextUrl.origin}/api/checkBan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: req.headers.get("Cookie") || "" },
      body: JSON.stringify({ id: req.auth.user.id }),
      next: { revalidate: 60, tags: ["banIssues"] },
    }).then((e) => e.json())) as Awaited<ReturnType<typeof checkBanAPI>>;
    if (response.isBanned) {
      return NextResponse.redirect(new URL(`/banIssue?time=current&resolve=no`, req.nextUrl));
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
