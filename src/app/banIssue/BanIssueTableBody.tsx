"use client";

import { TableBody, TableRow, TableCell, Alert } from "@mui/material";
import { resolveBanIssue } from "@/libs/banIssue";
import { useActionState, useEffect } from "react";
import { Session } from "next-auth";
import { useSnackpackContext } from "@/provider/SnackbarProvider";
import UserInfo from "@/components/UserInfo";
import { BanIssueDateCell, BanIssueStatus } from "@/components/banIssue/TableBodyCell";
import BanIssueOptionButton from "@/components/banIssue/OptionButton";
import { BanIssueType, UserType } from "@/libs/types";

export default function BanIssueTableBody({
  banIssues,
  redirected,
  session,
}: {
  banIssues: (Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType })[];
  redirected?: string;
  session: Session;
}) {
  const [editState, editAction, editPending] = useActionState(resolveBanIssue, undefined);
  const [, setSnackPack] = useSnackpackContext();

  useEffect(() => {
    if (redirected === "true") {
      setSnackPack((prev) => [
        ...prev,
        {
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
          key: new Date().getTime(),
          children: (
            <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
              You are banned
            </Alert>
          ),
        },
      ]);
    }
  }, [redirected, setSnackPack]);

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
              <UserInfo user={e.user} name email />
            </TableCell>
            <TableCell align="left">{e.title}</TableCell>
            <TableCell align="left">
              <BanIssueDateCell {...{ createdAt, endDate }} />
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
