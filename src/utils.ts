import { CWS } from "./libs/db/models/CoworkingSpace";

const protectedPages = [
  "/profile",
  "/banIssue",
  "/banAppeal",
  "/coworking-space/.*/edit",
  "/reservations.*",
  "/dashboard.*",
];
const protectedPathnameRegex = RegExp(`^(${protectedPages.flatMap((p) => p).join("|")})/?$`, "i");
export function isProtectedPage(pathname: string) {
  return protectedPathnameRegex.test(pathname);
}

export function concatAddress(coworkingSpace: CWS) {
  return `${coworkingSpace.address} ${coworkingSpace.district} ${coworkingSpace.subDistrict} ${coworkingSpace.province}, ${coworkingSpace.postalcode}`;
}

export function readSearchParams(params: { [key: string]: string | string[] | undefined }, key: string) {
  return params[key] instanceof Array ? params[key][0] : params[key];
}

export function readPaginationSearchParams(params: { [key: string]: string | string[] | undefined }) {
  return {
    page: (Number(readSearchParams(params, "page")) || 1) - 1,
    limit: Number(readSearchParams(params, "limit")) || undefined,
  };
}
