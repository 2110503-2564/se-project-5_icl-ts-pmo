import { Suspense } from "react";
import { authLoggedIn, readPaginationSearchParams, readSearchParams, SearchParams } from "@/utils";
import ReserveTable, { ReserveTableSkeleton } from "./ReserveTable";
import { getCoworkingSpace } from "@/libs/coworkingSpace";

export default async function Reservations({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const session = await authLoggedIn(`/dashboard/coworking-space/${id}`);
  const { page, limit = 5 } = readPaginationSearchParams(sp);
  const min = Number(readSearchParams(sp, "min")) || undefined;
  const max = Number(readSearchParams(sp, "max")) || undefined;
  const status = readSearchParams(sp, "status");

  const response = await getCoworkingSpace(id);

  if (!response.success) return <main>Cannot fetch data</main>;
  const { data: coworkingSpace } = response;

  return (
    <main className="p-4">
      <h1>{coworkingSpace.name}&lsquo;s Reservations</h1>
      <Suspense fallback={<ReserveTableSkeleton />}>
        <ReserveTable {...{ id, page, limit, min, max, status, session, coworkingSpace }} />
      </Suspense>
    </main>
  );
}
