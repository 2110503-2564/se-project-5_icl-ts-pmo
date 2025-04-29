import BanIssueTable, { BanIssueTableSkeleton } from "./BanIssueTable";
import { authLoggedIn, readPaginationSearchParams, readSearchParams, SearchParams } from "@/utils";
import SearchFieldSP from "@/components/SearchFieldSP";
import { Suspense } from "react";

export default async function BanIssues({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [session, params] = await Promise.all([authLoggedIn("/banIssue"), searchParams]);
  const { page, limit = 5 } = readPaginationSearchParams(params);
  const search = readSearchParams(params, "search") || "";
  const redirected = readSearchParams(params, "redirected");

  return (
    <main className="p-4">
      <h1>Active Ban Issues</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <div className="flex items-center justify-center gap-8 pb-2">
          {session.user.role == "admin" && <SearchFieldSP search={search} />}
        </div>
        <Suspense key={JSON.stringify(params)} fallback={<BanIssueTableSkeleton />}>
          <BanIssueTable {...{ page, limit, search, redirected, session }} />
        </Suspense>
      </div>
    </main>
  );
}
