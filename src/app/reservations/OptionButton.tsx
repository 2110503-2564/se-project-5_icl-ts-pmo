"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { IconButton, Menu } from "@mui/material";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { deleteReservation, editReservation } from "@/libs/reservations";
import { Reservation } from "@/libs/db/models/Reservation";
import { Session } from "next-auth";
import { UserType } from "@/libs/db/models/User";
import { CWS } from "@/libs/db/models/CoworkingSpace";

export default function OptionButton({
  reservation,
  session,
}: {
  reservation: Omit<Omit<Reservation, "coworkingSpace">, "user"> & { user: UserType; coworkingSpace: CWS };
  session: Session;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editState, editAction, editPending] = useActionState(editReservation, undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteState, deleteAction, deletePending] = useActionState(deleteReservation, undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <IconButton
        onClick={handleClick}
        id="basic-button"
        size="small"
        aria-controls={open ? "basic-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
      >
        <EllipsisHorizontalIcon width="1rem" height="1rem" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <LinkItem href={`/reservations/${reservation._id}`} onClick={handleClose}>
          View Info
        </LinkItem>
        {reservation.approvalStatus == "pending" && (
          <LinkItem href={`/reservations/${reservation._id}/edit`} onClick={handleClose}>
            Edit
          </LinkItem>
        )}
        {reservation.approvalStatus == "pending"
          // * Refactor if possible
          && [
            ...(session.user.id == reservation.user._id ? [{ status: "canceled", text: "Cancel" }] : []),
            ...(session.user.role == "admin" || session.user.id == reservation.coworkingSpace._id ?
              [
                { status: "approved", text: "Approve" },
                { status: "rejected", text: "Reject" },
              ]
            : []),
          ].map(({ status, text }) => (
            <li onClick={handleClose} key={text}>
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
        <li onClick={handleClose}>
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
      </Menu>
    </div>
  );
}

function LinkItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li onClick={onClick}>
      <Link className="inline-block w-full px-4 py-1.5 hover:bg-gray-100" href={href}>
        {children}
      </Link>
    </li>
  );
}
