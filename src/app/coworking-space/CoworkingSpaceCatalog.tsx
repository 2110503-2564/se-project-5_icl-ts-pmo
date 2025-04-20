import { getCoworkingSpaces } from "@/libs/coworkingSpace";
import PaginationSP from "@/components/PaginationSP";
import SearchFieldSP from "@/components/SearchFieldSP";
import { ProductCard } from "./CoworkingCard";

export default async function CoworkingSpaceCatalog({
  search,
  page,
  limit,
}: {
  search: string;
  page: number;
  limit: number;
}) {
  try {
    new RegExp(search);
  }catch(error){
    if(error instanceof SyntaxError){
      search = "^$."
    }
  }
  const response = await getCoworkingSpaces({ name: { $regex: search } }, page, limit);
  if (!response.data) return <span>Cannot fetch data</span>;

  const { data: coworkingSpaces } = response;
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <SearchFieldSP search={search} />
      <ul className="grid w-full grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] justify-items-center gap-4 p-4">
        {coworkingSpaces.map((coworkingSpace) => (
          <ProductCard key={coworkingSpace._id} coworkingSpace={coworkingSpace} />
        ))}
      </ul>
      <PaginationSP page={page} limit={limit} total={response.total} />
    </div>
  );
}
