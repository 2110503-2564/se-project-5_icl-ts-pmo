"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Session } from "next-auth";
import { Menu, IconButton, Tooltip } from "@mui/material";
import {
  PencilSquareIcon,
  KeyIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  ComputerDesktopIcon,
  NoSymbolIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import AvatarIcon from "./AvatarIcon";
import { userLogout } from "@/libs/auth";

export default function AvatarMenu({ session }: { session: Session | null }) {
  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const handleClick = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div>
      <Tooltip title="account-setting">
        <IconButton
          ref={anchorEl}
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
        >
          <AvatarIcon props={{ sx: { width: 32, height: 32 } }} name={session?.user.name} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl.current}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {session ?
          [
            <LinkItem href="/profile" handleClose={handleClose} key="profile">
              <UserCircleIcon width={16} height={16} />
              Profile
            </LinkItem>,
            <LinkItem href="/banIssue" handleClose={handleClose} key="banIssue">
              <NoSymbolIcon width={16} height={16} />
              Ban Issues
            </LinkItem>,
            session.user.role == "admin" && (
              <LinkItem href="/banAppeal" handleClose={handleClose} key="banAppeal">
                <ScaleIcon width={16} height={16} />
                Ban Appeal
              </LinkItem>
            ),
            <LinkItem href="/dashboard" handleClose={handleClose} key="dashboard">
              <ComputerDesktopIcon width={16} height={16} />
              Dashboard
            </LinkItem>,
            <li onClick={handleClose} key="logout">
              <form action={userLogout.bind(undefined, pathname)}>
                <button
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-1.5 hover:bg-gray-100"
                  type="submit"
                >
                  <ArrowRightStartOnRectangleIcon width={16} height={16} />
                  Logout
                </button>
              </form>
            </li>,
          ]
        : [
            <LinkItem
              href={`/register?callbackUrl=${callbackUrl ? callbackUrl : pathname}`}
              handleClose={handleClose}
              key="register"
            >
              <PencilSquareIcon width={16} height={16} />
              Register
            </LinkItem>,
            <LinkItem
              href={`/login?callbackUrl=${callbackUrl ? callbackUrl : pathname}`}
              handleClose={handleClose}
              key="login"
            >
              <KeyIcon width={16} height={16} />
              Login
            </LinkItem>,
          ]
        }
      </Menu>
    </div>
  );
}

function LinkItem({
  href,
  handleClose,
  children,
}: {
  href: string;
  handleClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <li onClick={handleClose}>
      <Link className="flex items-center gap-2 px-4 py-1.5 hover:bg-gray-100" href={href}>
        {children}
      </Link>
    </li>
  );
}
