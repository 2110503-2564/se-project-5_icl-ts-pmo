import { getCoworkingSpaces } from "@/libs/coworkingSpace";
import PaginationSP from "@/components/PaginationSP";
import Image from "next/image";
import Link from "next/link";
import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { concatAddress } from "@/utils";

export default async function CoworkingSpaceCatalog({
  search,
  page,
  limit,
}: {
  search: string;
  page: number;
  limit: number;
}) {
  const response = await getCoworkingSpaces(page, limit, search);
  if (!response.success) return <span>Cannot fetch data</span>;
  const { data: coworkingSpaces } = response;

  return (
    <>
      <ul className="grid w-full grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] justify-items-center gap-4 p-4">
        {coworkingSpaces.map((coworkingSpace) => {
          const openTime = new Date(coworkingSpace.openTime);
          const closeTime = new Date(coworkingSpace.closeTime);
          return (
            <li
              className="h-80 w-60 rounded-t-2xl rounded-b-xl border shadow-lg transition hover:scale-105 hover:shadow-2xl"
              key={coworkingSpace._id}
            >
              <Link href={`/coworking-space/${coworkingSpace._id}`}>
                <Image
                  className="h-[67%] w-full rounded-t-2xl object-cover"
                  src={coworkingSpace.picture ? coworkingSpace.picture : "/img/BOT-learning-center.jpg"}
                  alt="CoworkingSpace Picture"
                  width={0}
                  height={0}
                  sizes="40vw"
                />
                <div className="flex h-[33%] w-full flex-col p-2">
                  <span className="my-1 inline-block w-full overflow-hidden font-medium text-ellipsis whitespace-nowrap">
                    {coworkingSpace.name}
                  </span>
                  {[
                    {
                      Icon: ClockIcon,
                      text: `${openTime.toLocaleTimeString()} - ${closeTime.toLocaleTimeString()}`,
                    },
                    { Icon: MapPinIcon, text: concatAddress(coworkingSpace) },
                  ].map(({ Icon, text }) => (
                    <div className="flex items-center gap-2" title={text} key={text}>
                      <Icon width="1rem" height="1rem" />
                      <span className="inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <PaginationSP page={page} limit={limit} total={response.total} />
    </>
  );
}

export function CoworkingSpaceSkeletonCatalog() {
  return (
    <ul className="grid w-full grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] justify-items-center gap-4 p-4">
      {[...Array(3)].map((e, i) => (
        <div className="h-80 w-60 rounded-t-2xl rounded-b-xl border-gray-500 shadow-lg" key={i}>
          <div className="h-[67%] animate-pulse rounded-t-2xl bg-gray-300"></div>
          <div className="flex h-[33%] w-full flex-col gap-2 p-2">
            <div className="my-1 h-6 w-36 animate-pulse rounded bg-gray-300"></div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-300"></div>
            <div className="h-4 w-52 animate-pulse rounded bg-gray-300"></div>
          </div>
        </div>
      ))}
    </ul>
  );
}
