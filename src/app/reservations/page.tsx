import { Suspense } from "react";
import SearchFieldSP from "@/components/SearchFieldSP";
import { readPaginationSearchParams, readSearchParams } from "@/utils";
import FilterDialog from "./FilterDialog";
import TableBody, { ReserveTableSkeleton } from "./ReserveTable";

export default async function Reservations({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { page, limit = 5 } = readPaginationSearchParams(params);
  const search = readSearchParams(params, "search") || "";
  const min = Number(readSearchParams(params, "min")) || undefined;
  const max = Number(readSearchParams(params, "max")) || undefined;

  return (
    <main className="p-4">
      <h1>Reservations</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <div className="flex items-center justify-center gap-4 pb-2">
          <SearchFieldSP search={search} />
          <FilterDialog />
        </div>
        <Suspense fallback={<ReserveTableSkeleton />}>
          <TableBody page={page} limit={limit} search={search} min={min} max={max} />
        </Suspense>
      </div>
    </main>
  );
}
