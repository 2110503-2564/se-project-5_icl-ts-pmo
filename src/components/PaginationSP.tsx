"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination } from "@mui/material";

export default function PaginationSP({ page, limit, total }: { page: number; limit: number; total: number }) {
  const [pathname, searchParams] = [usePathname(), useSearchParams()];
  const { replace } = useRouter();

  const changePage = (value: number) => {
    if (value != page + 1) {
      const params = new URLSearchParams(searchParams);
      params.set("page", value.toString());
      replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <Pagination
      page={page + 1}
      count={Math.ceil(total / limit)}
      showFirstButton
      showLastButton
      onChange={(_, page) => changePage(page)}
    />
  );
}
