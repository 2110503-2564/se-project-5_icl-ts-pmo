import { Session } from "next-auth";
import Link from "next/link";
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
import { getUserBanIssues } from "@/libs/banIssue";
import TablePaginationSP from "@/components/TablePaginationSP";
import BanIssueTableBody from "./BanIssueTableBody";

export default async function BanHistoryTable({
  page,
  limit,
  search,
  session,
  id,
}: {
  page: number;
  limit: number;
  search: string;
  session: Session;
  id: string;
}) {
  const response = await getUserBanIssues(id, session, { page, limit, search });
  console.log(response);

  if (!response.success) return <main>Cannot fetch data</main>;
  const { data: banIssues } = response;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Issue Title</TableCell>
              <TableCell align="left">Issue Date</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="center">
                {session.user.role == "admin" && session.user._id != id && (
                  <Link href={`/user/${id}/ban`}>
                    <Button type="submit" color="error" variant="contained">
                      Ban
                    </Button>
                  </Link>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <BanIssueTableBody banIssues={banIssues} session={session} />
        </Table>
        <TablePaginationSP page={page} limit={limit} total={response.total} />
      </TableContainer>
    </Paper>
  );
}

export function BanHistoryTableSkeleton() {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {[...Array(3)].map((e, i) => (
                <TableCell align="left" key={i}>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
                </TableCell>
              ))}
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover role="checkbox" tabIndex={-1}>
              <TableCell align="left">
                <div className="h-4 w-36 animate-pulse rounded bg-gray-300"></div>
              </TableCell>
              <TableCell align="left">
                <div className="flex flex-col gap-1">
                  <div className="h-4 w-52 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-52 animate-pulse rounded bg-gray-300"></div>
                </div>
              </TableCell>
              <TableCell align="left">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
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
