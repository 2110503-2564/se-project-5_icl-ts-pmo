import { redirect } from "next/navigation";
import { auth } from "./auth";
import { CoworkingSpaceType } from "./libs/types";

const protectedPages = [
  "/banIssue.*",
  "/banAppeal",
  "/coworking-space/.*/edit",
  "/reservations.*",
  "/dashboard.*",
];
const protectedPathnameRegex = RegExp(`^(${protectedPages.flatMap((p) => p).join("|")})/?$`, "i");
export function isProtectedPage(pathname: string) {
  return protectedPathnameRegex.test(pathname);
}

export async function authLoggedIn(pathname: string) {
  const session = await auth();
  if (!session) {
    redirect(`/login?callbackUrl=${pathname}&redirected=true`);
  }
  return session;
}

export function concatAddress(coworkingSpace: CoworkingSpaceType) {
  return `${coworkingSpace.address} ${coworkingSpace.district} ${coworkingSpace.subDistrict} ${coworkingSpace.province}, ${coworkingSpace.postalcode}`;
}

export type SearchParams = { [key: string]: string | string[] | undefined };

export function readSearchParams(params: SearchParams, key: string) {
  return params[key] instanceof Array ? params[key][0] : params[key];
}

export function readMutipleSearchParams<T extends string>(params: SearchParams, ...keys: T[]) {
  return Object.fromEntries(keys.map((key) => [key, readSearchParams(params, key)])) as {
    [P in T]: ReturnType<typeof readSearchParams>;
  };
}

export function readPaginationSearchParams(params: SearchParams) {
  return {
    page: (Number(readSearchParams(params, "page")) || 1) - 1,
    limit: Number(readSearchParams(params, "limit")) || undefined,
  };
}

export function validateRegex(value: string) {
  try {
    new RegExp(value);
  } catch {
    return "^$.";
  }
  return value;
}
