import { Session } from "next-auth";
import clsx from "clsx";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { readPaginationSearchParams, readSearchParams } from "@/utils";
import AvatarIcon from "@/components/AvatarIcon";
import SearchFieldSP from "@/components/SearchFieldSP";
import TablePaginationSP from "@/components/TablePaginationSP";
import OptionButton from "./OptionButton";
import FilterDialog from "./FilterDialog";
import DateCell from "./DateCell";
import { getBanAppeals } from "@/libs/banAppeal";

export default async function BanAppealTable({
  searchParams,
  session,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  session: Session;
}) {
  const { page, limit = 5 } = readPaginationSearchParams(searchParams);
  const search = readSearchParams(searchParams, "search") || "";
  const response = await getBanAppeals({}, page, limit, search);
  if (!response.data) return <main>Cannot fetch data</main>;
  const { data: banAppeal } = response;

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border p-8">
      <div className="flex items-center justify-center gap-8 pb-2">
        <SearchFieldSP search={search} />
        <FilterDialog />
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left">User</TableCell>
                <TableCell align="left">Issue Title</TableCell>
                <TableCell align="left">Issue Date</TableCell>
                <TableCell align="left">Appeal Status</TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banAppeal.map((e) => {
                const createdAt = new Date(e.banIssue.createdAt);
                const endDate = new Date(e.banIssue.endDate);
                const appealDate = new Date(e.createdAt);

                return (
                  <TableRow key={e._id} hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">
                      <div className="flex items-center gap-2">
                        <AvatarIcon name={e.banIssue.user.name} />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{e.banIssue.user.name}</span>
                          <span>{e.banIssue.user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="left">{e.banIssue.title}</TableCell>
                    <TableCell align="left">
                      <DateCell createdAt={createdAt} endDate={endDate} />
                    </TableCell>
                    <TableCell align="left">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
                              e.resolveStatus == "pending" && "bg-amber-300",
                              e.resolveStatus == "denied" && "bg-red-500",
                              e.resolveStatus == "resolved" && "bg-green-500"
                            )}
                          ></span>
                          <span>{e.resolveStatus}</span>
                        </div>
                        <span>Appeal at: {appealDate.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <OptionButton banAppeal={e} session={session} />
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
