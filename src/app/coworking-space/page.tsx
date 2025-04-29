import { Suspense } from "react";
import CoworkingSpaceCatalog, { CoworkingSpaceSkeletonCatalog } from "./CoworkingSpaceCatalog";
import { readPaginationSearchParams, readSearchParams } from "@/utils";
import SearchFieldSP from "@/components/SearchFieldSP";

export default async function CoworkingSpace({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = readSearchParams(params, "search") || "";
  const { page, limit = 25 } = readPaginationSearchParams(params);

  return (
    <main className="flex flex-col items-center gap-8 p-4">
      <h1>Co-working Spaces</h1>
      <div className="flex w-full flex-col items-center gap-2">
        <SearchFieldSP search={search} />
        <Suspense key={JSON.stringify(params)} fallback={<CoworkingSpaceSkeletonCatalog />}>
          <CoworkingSpaceCatalog search={search} page={page} limit={limit} />
        </Suspense>
      </div>
      <hr className="my-10" />
    </main>
  );
}
