import Link from "next/link";
import { Session } from "next-auth";
import clsx from "clsx";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { getBanIssues, resolveExpiredBan } from "@/libs/banIssue";
import { readPaginationSearchParams, readSearchParams } from "@/utils";
import AvatarIcon from "@/components/AvatarIcon";
import SearchFieldSP from "@/components/SearchFieldSP";
import TablePaginationSP from "@/components/TablePaginationSP";
import OptionButton from "./OptionButton";
import FilterDialog from "./FilterDialog";
import DateCell from "./DateCell";
import { FilterQuery } from "mongoose";
import { BanIssueType } from "@/libs/db/models/BanIssue";

export default async function BanIssueTable({
  searchParams,
  session,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  session: Session;
}) {
  const { page, limit = 5 } = readPaginationSearchParams(searchParams);
  const search = readSearchParams(searchParams, "search") || "";
  const time = readSearchParams(searchParams, "time") || "";
  const resolve = readSearchParams(searchParams, "resolve") || "";
  // * Refactor this
  const filter: FilterQuery<BanIssueType> = {};
  if (time == "current") {
    filter.endDate = { $gte: new Date() };
  } else if (time == "past") {
    filter.endDate = { $lte: new Date() };
  }
  if (resolve == "yes") {
    filter.isResolved = true;
  } else if (resolve == "no") {
    filter.isResolved = false;
  }
  await resolveExpiredBan();
  const response = await getBanIssues(filter, page, limit, search);
  if (!response.data) return <main>Cannot fetch data</main>;
  const { data: banIssues } = response;

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border p-8">
      <div className="flex items-center justify-center gap-8 pb-2">
        {session.user.role == "admin" ?
          <>
            <SearchFieldSP search={search} />
            <FilterDialog />
            <Link href="/banIssue/create">
              <Button type="submit" color="primary" variant="contained">
                + New
              </Button>
            </Link>
          </>
        : <>
            <FilterDialog />
          </>
        }
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left">User</TableCell>
                <TableCell align="left">Issue Title</TableCell>
                <TableCell align="left">Issue Date</TableCell>
                <TableCell align="left">Status</TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banIssues.map((e) => {
                const createdAt = new Date(e.createdAt);
                const endDate = new Date(e.endDate);

                return (
                  <TableRow key={e._id} hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">
                      <div className="flex items-center gap-2">
                        <AvatarIcon name={e.user.name} />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{e.user.name}</span>
                          <span>{e.user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="left">{e.title}</TableCell>
                    <TableCell align="left">
                      <DateCell createdAt={createdAt} endDate={endDate} />
                    </TableCell>
                    <TableCell align="left">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
                            e.isResolved ? "bg-green-500" : "bg-red-500"
                          )}
                        ></span>
                        <span>{e.isResolved ? "Resolved" : "Not Resolved"}</span>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <OptionButton banIssue={e} session={session} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePaginationSP page={page} limit={limit} total={response.total} />
        </TableContainer>
      </Paper>
    </div>
  );
}
