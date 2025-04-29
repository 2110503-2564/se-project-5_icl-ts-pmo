"use client";

import { useState } from "react";
import { Menu as MuiMenu } from "@mui/material";
import Link from "next/link";

export default function Menu({
  children,
  buttonChildren,
}: {
  children: Readonly<React.ReactNode>;
  buttonChildren: Readonly<React.ReactNode>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <div className="cursor-pointer" onClick={handleClick}>
        {buttonChildren}
      </div>
      <MuiMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        {children}
      </MuiMenu>
    </div>
  );
}

export function LinkItem({
  href,
  text,
  children,
}: {
  href: string;
  text?: string;
  children?: Readonly<React.ReactNode>;
}) {
  return (
    <li>
      <Link className="inline-block w-full px-4 py-1.5 hover:bg-gray-100" href={href}>
        {children || text}
      </Link>
    </li>
  );
}

export function ActionItem({
  action,
  pending,
  text,
  children,
}: {
  action: React.FormHTMLAttributes<HTMLFormElement>["action"];
  pending?: boolean;
  text?: string;
  children?: Readonly<React.ReactNode>;
}) {
  return (
    <li>
      <form action={action}>
        {children}
        <button
          className="w-full cursor-pointer px-4 py-1.5 text-left hover:bg-gray-100"
          type="submit"
          disabled={pending}
        >
          {text}
        </button>
      </form>
    </li>
  );
}
