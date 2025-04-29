"use client";

import { TableBody, TableRow, TableCell, Alert } from "@mui/material";
import { resolveBanIssue } from "@/libs/banIssue";
import { useActionState, useEffect } from "react";
import { Session } from "next-auth";
import { useSnackpackContext } from "@/provider/SnackbarProvider";
import { BanIssueStatus } from "@/components/banIssue/TableBodyCell";
import BanIssueOptionButton from "@/components/banIssue/OptionButton";
import { BanIssueType, UserType } from "@/libs/types";

export default function BanIssueTableBody({
  banIssues,
  session,
}: {
  banIssues: (Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType })[];
  session: Session;
}) {
  const [editState, editAction, editPending] = useActionState(resolveBanIssue, undefined);
  const [, setSnackPack] = useSnackpackContext();

  useEffect(() => {
    if (editState) {
      setSnackPack((prev) => [
        ...prev,
        {
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
          key: new Date().getTime(),
          children: (
            <Alert severity={editState.success ? "success" : "error"} variant="filled" sx={{ width: "100%" }}>
              {editState.success ? "Ban Issue resolved" : editState.message || "Error Occur"}
            </Alert>
          ),
        },
      ]);
    }
  }, [editState, setSnackPack]);

  return (
    <TableBody>
      {banIssues.map((e) => {
        const createdAt = new Date(e.createdAt);
        const endDate = new Date(e.endDate);

        return (
          <TableRow key={e._id} hover role="checkbox" tabIndex={-1}>
            <TableCell align="left">
              <span className="font-bold">{e.title}</span>
            </TableCell>
            <TableCell align="left">
              <div className="flex w-fit flex-col gap-1">
                <span>Issue At: {createdAt.toLocaleString()}</span>
                <span>End At: {endDate.toLocaleString()}</span>
              </div>
            </TableCell>
            <TableCell align="left">
              <BanIssueStatus isResolved={e.isResolved} />
            </TableCell>
            <TableCell align="center">
              <BanIssueOptionButton
                id={e._id}
                viewInfo
                appeal={session.user._id == e.user._id}
                resolve={
                  session.user.role == "admin" && !e.isResolved ?
                    { action: editAction, pending: editPending }
                  : undefined
                }
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
