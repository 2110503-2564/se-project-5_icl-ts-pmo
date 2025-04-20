"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { IconButton, Menu } from "@mui/material";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { resolveBanAppeal } from "@/libs/banAppeal";
import { UserType } from "@/libs/db/models/User";
import { BanIssueType } from "@/libs/db/models/BanIssue";
import { BanAppealType } from "@/libs/db/models/BanAppeal";

export default function OptionButton({
  banAppeal,
  session,
}: {
  // * Refactor this
  banAppeal: Omit<Omit<BanAppealType, "comment">, "banIssue"> & {
    banIssue: Omit<BanIssueType, "user"> & { user: UserType };
  };
  session: Session;
}) {
  const approve = useActionState(resolveBanAppeal.bind(undefined, banAppeal._id, "resolved"), undefined);
  const deny = useActionState(resolveBanAppeal.bind(undefined, banAppeal._id, "denied"), undefined);
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
        <li onClick={handleClose}>
          <Link
            className="inline-block w-full px-4 py-1.5 hover:bg-gray-100"
            href={`/banIssue/${banAppeal.banIssue._id}/${banAppeal._id}`}
          >
            View Info
          </Link>
        </li>
        {session.user.role == "admin"
          && banAppeal.resolveStatus == "pending"
          && [
            { text: "Approve", action: approve },
            { text: "Deny", action: deny },
          ].map(({ text, action }) => (
            <li onClick={handleClose} key={text}>
              <form action={action[1]}>
                <input type="text" name="id" value={banAppeal._id} hidden readOnly />
                <button
                  className="w-full cursor-pointer px-4 py-1.5 text-left hover:bg-gray-100"
                  type="submit"
                  disabled={action[2]}
                >
                  {text}
                </button>
              </form>
            </li>
          ))}
      </Menu>
    </div>
  );
}
