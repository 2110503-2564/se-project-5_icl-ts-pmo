"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { TablePagination } from "@mui/material";

export default function TablePaginationSP({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", (page + 1).toString());
    replace(`${pathname}?${params.toString()}`);
  };

  const changeLimit = (limit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.set("limit", limit);
    replace(`${pathname}?${params.toString()}`);
  };

  const options = [5, 10, 25];
  if (!options.includes(limit)) {
    options.push(limit);
    options.sort((a, b) => a - b);
  }

  return (
    <TablePagination
      showFirstButton
      showLastButton
      component="div"
      count={total}
      page={page}
      rowsPerPage={limit}
      rowsPerPageOptions={options}
      onPageChange={(_, page) => changePage(page)}
      onRowsPerPageChange={(e) => changeLimit(e.target.value)}
    />
  );
}
