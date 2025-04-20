"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { IconButton, Menu } from "@mui/material";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { resolveBanIssue } from "@/libs/banIssue";
import { Session } from "next-auth";
import { BanIssueType } from "@/libs/db/models/BanIssue";

export default function OptionButton({ banIssue, session }: { banIssue: BanIssueType; session: Session }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, action, pending] = useActionState(resolveBanIssue.bind(undefined, banIssue._id), undefined);
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
        onClick={handleClose}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <li>
          <Link
            className="inline-block w-full px-4 py-1.5 hover:bg-gray-100"
            href={`/banIssue/${banIssue._id}`}
          >
            View Info
          </Link>
        </li>
        {session.user.id == banIssue.user._id && (
          <li>
            <Link
              className="inline-block w-full px-4 py-1.5 hover:bg-gray-100"
              href={`/banIssue/${banIssue._id}/appeal`}
            >
              Make an appeal
            </Link>
          </li>
        )}
        {session.user.role == "admin" && !banIssue.isResolved && (
          <li onClick={handleClose}>
            <form action={action}>
              <input type="text" name="id" value={banIssue._id} hidden readOnly />
              <button
                className="w-full cursor-pointer px-4 py-1.5 text-left hover:bg-gray-100"
                type="submit"
                disabled={pending}
              >
                Resolve Ban
              </button>
            </form>
          </li>
        )}
      </Menu>
    </div>
  );
}
