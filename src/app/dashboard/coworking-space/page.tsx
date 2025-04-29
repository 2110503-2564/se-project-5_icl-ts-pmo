import { authLoggedIn, readPaginationSearchParams, readSearchParams } from "@/utils";
import CWSTable from "./CoworkingSpaceTable";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params] = await Promise.all([searchParams, authLoggedIn("/dashboard/coworking-space")]);
  const { page, limit = 15 } = readPaginationSearchParams(params);
  const search = readSearchParams(params, "search") || "";

  return (
    <main className="p-4">
      <h1>Coworking-Spaces</h1>
      <CWSTable page={page} limit={limit} search={search} />
    </main>
  );
}
