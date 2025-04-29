"use client";

import UserInfo from "@/components/UserInfo";
import { Alert, TableBody, TableCell, TableRow } from "@mui/material";
import { Session } from "next-auth";
import { updateBanAppeal } from "@/libs/banAppeal";
import { useActionState, useEffect } from "react";
import { useSnackpackContext } from "@/provider/SnackbarProvider";
import { AppealStatus } from "@/components/banAppeal/TableBodyCell";
import BanAppealOptionButton from "@/components/banAppeal/OptionButton";
import { BanAppealType, BanIssueType, UserType } from "@/libs/types";

export default function BanAppealTableBody({
  banAppeals,
  session,
}: {
  banAppeals: (Omit<Omit<BanAppealType, "comment">, "banIssue"> & {
    banIssue: Omit<BanIssueType, "user"> & { user: UserType };
  })[];
  session: Session;
}) {
  const [editState, editAction, editPending] = useActionState(updateBanAppeal, undefined);
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
              {editState.success ?
                `Ban Appeal ${editState.data?.resolveStatus}`
              : editState.message || "Error Occur"}
            </Alert>
          ),
        },
      ]);
    }
  }, [editState, setSnackPack]);

  return (
    <TableBody>
      {banAppeals.map((e) => {
        const createdAt = new Date(e.banIssue.createdAt);
        const endDate = new Date(e.banIssue.endDate);
        const appealDate = new Date(e.createdAt);

        return (
          <TableRow key={e._id} hover role="checkbox" tabIndex={-1}>
            <TableCell align="left">
              <UserInfo user={e.banIssue.user} name email />
            </TableCell>
            <TableCell align="left">{e.banIssue.title}</TableCell>
            <TableCell align="left">
              <div className="flex w-fit flex-col gap-1">
                <span>Issue At: {createdAt.toLocaleString()}</span>
                <span>End At: {endDate.toLocaleString()}</span>
              </div>
            </TableCell>
            <TableCell align="left">
              <div className="flex flex-col gap-2">
                <AppealStatus resolveStatus={e.resolveStatus} />
                <span>Appeal at: {appealDate.toLocaleString()}</span>
              </div>
            </TableCell>
            <TableCell align="center">
              <BanAppealOptionButton
                banIssueID={e.banIssue._id}
                banAppealID={e._id}
                viewInfo
                edit={
                  session.user.role == "admin" && e.resolveStatus == "pending" ?
                    { approve: true, deny: true, action: editAction, pending: editPending }
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
