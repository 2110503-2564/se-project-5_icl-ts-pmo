"use client";

import Image from "next/image";
import clsx from "clsx";
import { concatAddress } from "@/utils";
import { UserGroupIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import AvatarIcon from "@/components/AvatarIcon";
import DateCell from "./ReserveDateCell";
import { CWS } from "@/libs/db/models/CoworkingSpace";
import { ReservationType } from "@/libs/db/models/Reservation";
import { UserType } from "@/libs/db/models/User";
import { TableBody, TableRow, TableCell } from "@mui/material";
import { Session } from "next-auth";
import Alert from "@mui/material/Alert";
import { deleteReservation, updateReservationStatus } from "@/libs/reservations";
import OptionButton from "@/components/OptionButton";
import Link from "next/link";
import { useSnackpackContext } from "@/provider/SnackbarProvider";
import { useActionState, useEffect } from "react";

export default function ReserveTableBody({
  session,
  reservations,
}: {
  session: Session;
  reservations: (Omit<Omit<ReservationType, "coworkingSpace">, "user"> & {
    user: UserType;
    coworkingSpace: CWS;
  })[];
}) {
  const editActionState = useActionState(updateReservationStatus, undefined);
  const deleteActionState = useActionState(deleteReservation, undefined);
  const [editState] = editActionState;
  const [deleteState] = deleteActionState;
  const [, setSnackPack] = useSnackpackContext();

  useEffect(() => {
    if (editState || deleteState) {
      const success = editState?.success || deleteState?.success;
      const message = editState?.message || deleteState?.message;
      setSnackPack((prev) => [
        ...prev,
        {
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
          key: new Date().getTime(),
          children: (
            <Alert severity={success ? "success" : "error"} variant="filled" sx={{ width: "100%" }}>
              {success ?
                `Reservation ${editState?.success ? editState.data?.approvalStatus : "Deleted"}`
              : message || "Error Occur"}
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
        return (
          <TableRow key={e._id} hover role="checkbox" tabIndex={-1}>
            <TableCell align="left">
              <div className="flex items-center gap-4">
                <Image
                  className="aspect-square h-12 object-cover"
                  src={e.coworkingSpace.picture || "/img/BOT-learning-center.jpg"}
                  alt="coworking image"
                  width={48}
                  height={48}
                />
                <div className="flex flex-col gap-2">
                  <span className="font-bold">{e.coworkingSpace.name}</span>
                  <span>{concatAddress(e.coworkingSpace)}</span>
                </div>
              </div>
            </TableCell>
            <TableCell align="left">
              <DateCell startDate={startDate} endDate={endDate}></DateCell>
            </TableCell>
            <TableCell align="left">
              <div className="grid w-fit grid-cols-[auto_auto] grid-rows-[auto_auto] items-center gap-2">
                {(e.personCount == 1 && <UserIcon width="1rem" height="1rem" />)
                  || (e.personCount == 2 && <UsersIcon width="1rem" height="1rem" />) || (
                    <UserGroupIcon width="1rem" height="1rem" />
                  )}
                <span>{e.personCount}</span>
                <span
                  className={clsx(
                    "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
                    e.approvalStatus == "pending" && "bg-amber-300",
                    e.approvalStatus == "canceled" && "bg-red-300",
                    e.approvalStatus == "rejected" && "bg-red-500",
                    e.approvalStatus == "approved" && "bg-green-500"
                  )}
                ></span>
                <span>{e.approvalStatus}</span>
              </div>
            </TableCell>
            <TableCell align="left">
              <div className="flex items-center gap-2">
                <AvatarIcon
                  props={{ sx: { width: 24, height: 24, fontSize: "0.875rem" } }}
                  name={e.user.name}
                />
                <span>{e.user.name}</span>
              </div>
            </TableCell>
            <TableCell align="center">
              <TableOptionButton
                session={session}
                reservation={e}
                editActionState={editActionState}
                deleteActionState={deleteActionState}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}

function TableOptionButton({
  session,
  reservation,
  editActionState,
  deleteActionState,
}: {
  session: Session;
  reservation: Omit<Omit<ReservationType, "coworkingSpace">, "user"> & {
    user: UserType;
    coworkingSpace: CWS;
  };
  editActionState: ReturnType<
    typeof useActionState<ReturnType<typeof updateReservationStatus> | undefined, FormData>
  >;
  deleteActionState: ReturnType<
    typeof useActionState<ReturnType<typeof deleteReservation> | undefined, FormData>
  >;
}) {
  const [editState, editAction, editPending] = editActionState;
  const [deleteState, deleteAction, deletePending] = deleteActionState;
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
              {editState.success ? "Reservation Updated" : editState.message || "Error Occur"}
            </Alert>
          ),
        },
      ]);
    }
  }, [editState, deleteState, setSnackPack]);

  return (
    <OptionButton>
      <li>
        <Link
          className="inline-block w-full px-4 py-1.5 hover:bg-gray-100"
          href={`/reservations/${reservation._id}`}
        >
          View Info
        </Link>
      </li>
      {reservation.approvalStatus == "pending"
        // * Refactor if possible
        && [
          ...(session.user.id == reservation.user._id ? [{ status: "canceled", text: "Cancel" }] : []),
          ...(session.user.role == "admin" || session.user.id == reservation.coworkingSpace.owner ?
            [
              { status: "approved", text: "Approve" },
              { status: "rejected", text: "Reject" },
            ]
          : []),
        ].map(({ status, text }) => (
          <li key={text}>
            <form action={editAction}>
              <input type="text" name="id" value={reservation._id} hidden readOnly />
              <input type="text" name="approvalStatus" value={status} hidden readOnly />
              <button
                className="w-full cursor-pointer px-4 py-1.5 text-left hover:bg-gray-100"
                type="submit"
                disabled={editPending}
              >
                {text}
              </button>
            </form>
          </li>
        ))}
      <li>
        <form action={deleteAction}>
          <input type="text" name="id" value={reservation._id} hidden readOnly />
          <button
            className="w-full cursor-pointer px-4 py-1.5 text-left hover:bg-gray-100"
            type="submit"
            disabled={deletePending}
          >
            Delete
          </button>
        </form>
      </li>
    </OptionButton>
  );
}
