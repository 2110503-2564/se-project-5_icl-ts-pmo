import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePaginationSP from "@/components/TablePaginationSP";
import { auth } from "@/auth";
import { getReservations } from "@/libs/reservations";
import ReserveTableBody from "./ReserveTableBody";

export default async function ReserveTableLoaded({
  page,
  limit,
  search,
  min,
  max,
}: {
  page: number;
  limit: number;
  search: string;
  min?: number;
  max?: number;
}) {
  // For loading test
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  const response = await getReservations(
    min && max ? { personCount: { $gte: min, $lte: max } } : {},
    page,
    limit,
    search
  );
  if (!response.data) return <main>Cannot fetch data</main>;

  const session = await auth();
  if (!session) return <main>Login to view reservations</main>;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">User</TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <ReserveTableBody session={session} reservations={response.data} />
        </Table>
        <TablePaginationSP page={page} limit={limit} total={response.total} />
      </TableContainer>
    </Paper>
  );
}

export function ReserveTableSkeleton() {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="left">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
              </TableCell>
              <TableCell align="left">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
              </TableCell>
              <TableCell align="left">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
              </TableCell>
              <TableCell align="left">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
              </TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover role="checkbox" tabIndex={-1}>
              <TableCell align="left">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded bg-gray-300"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    <div className="h-4 w-52 animate-pulse rounded bg-gray-300"></div>
                  </div>
                </div>
              </TableCell>
              <TableCell align="left">
                <div className="flex w-fit flex-col items-center gap-1">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-300"></div>
                </div>
              </TableCell>
              <TableCell align="left">
                <div className="flex flex-col gap-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                </div>
              </TableCell>
              <TableCell align="left">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300"></div>
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
                </div>
              </TableCell>
              <TableCell align="center">
                <div className="h-2 w-4 animate-pulse rounded-full bg-gray-300"></div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
