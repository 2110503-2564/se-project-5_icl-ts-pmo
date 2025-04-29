import BanAppealTable, { BanAppealTableSkeleton } from "./BanAppealTable";
import { authLoggedIn, readPaginationSearchParams, readSearchParams } from "@/utils";
import SearchFieldSP from "@/components/SearchFieldSP";
import FilterDialog from "./FilterDialog";
import { Suspense } from "react";

export default async function BanAppeals({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, session] = await Promise.all([searchParams, authLoggedIn("/dashboard/banAppeal")]);
  const { page, limit = 5 } = readPaginationSearchParams(params);
  const search = readSearchParams(params, "search") || "";

  return (
    <main className="p-4">
      <h1>Ban Appeal</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <div className="flex items-center justify-center gap-8 pb-2">
          <SearchFieldSP search={search} />
          <FilterDialog />
        </div>
        <Suspense key={JSON.stringify(params)} fallback={<BanAppealTableSkeleton />}>
          <BanAppealTable page={page} limit={limit} search={search} session={session} />
        </Suspense>
      </div>
    </main>
  );
}
