"use client";

import { TableBody, TableRow, TableCell } from "@mui/material";
import { Session } from "next-auth";
import Alert from "@mui/material/Alert";
import { deleteReservation, updateReservationStatus } from "@/libs/reservations";
import { useSnackpackContext } from "@/provider/SnackbarProvider";
import { useActionState, useEffect } from "react";
import ReservationOptionButton from "@/components/reservations/OptionButton";
import { ReserveDateCell, ReserveStatusCell } from "@/components/reservations/TableBodyCell";
import { CoworkingSpaceCell } from "@/components/coworkingSpace/TableBodyCell";
import { ReservationType, CoworkingSpaceType } from "@/libs/types";

export default function ReserveTableBody({
  session,
  reservations,
}: {
  session: Session;
  reservations: (Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType })[];
}) {
  const [editState, editAction, editPending] = useActionState(updateReservationStatus, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteReservation, undefined);
  const [, setSnackPack] = useSnackpackContext();

  useEffect(() => {
    if (editState?.success || deleteState?.success) {
      const success = editState?.success || deleteState?.success;
      // const message = editState?.message || deleteState?.message;
      setSnackPack((prev) => [
        ...prev,
        {
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
          key: new Date().getTime(),
          children: (
            <Alert severity={success ? "success" : "error"} variant="filled" sx={{ width: "100%" }}>
              {success ?
                `Reservation ${editState?.success ? editState.data?.approvalStatus : "Deleted"}`
              : /* message || */ "Error Occur"}
            </Alert>
          ),
        },
      ]);
    }
  }, [editState, deleteState, setSnackPack]);

  return (
    <TableBody>
      {reservations.map((e) => {
        const startDate = new Date(e.startDate);
        const endDate = new Date(e.endDate);
        const adminPermission = session.user.role == "admin" || session.user._id == e.coworkingSpace.owner;
        return (
          <TableRow key={e._id} hover role="checkbox" tabIndex={-1}>
            <TableCell align="left">
              <CoworkingSpaceCell
                coworkingSpace={e.coworkingSpace}
                menu={{
                  viewInfo: true,
                  searchReservation: true,
                  manageReservation: true,
                  viewDashboard: true,
                }}
              />
            </TableCell>
            <TableCell align="left">
              <ReserveDateCell {...{ startDate, endDate }} />
            </TableCell>
            <TableCell align="left">
              <ReserveStatusCell approvalStatus={e.approvalStatus} personCount={e.personCount} />
            </TableCell>
            <TableCell align="center">
              <ReservationOptionButton
                id={e._id}
                viewInfo
                edit={
                  e.approvalStatus == "pending" ?
                    {
                      cancel: session.user._id == e.user,
                      approve: adminPermission,
                      reject: adminPermission,
                      action: editAction,
                      pending: editPending,
                    }
                  : undefined
                }
                deleteOption={
                  e.approvalStatus == "pending" && adminPermission ?
                    { action: deleteAction, pending: deletePending }
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
