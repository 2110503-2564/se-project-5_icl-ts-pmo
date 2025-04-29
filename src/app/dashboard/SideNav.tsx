"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import ChevronLeftIcon from "@heroicons/react/24/solid/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";

export default function SideNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <div className="relative z-30 flex h-full w-fit flex-col shadow-sm shadow-blue-400">
      <nav className={clsx("flex flex-col overflow-x-hidden", open ? "w-fit" : "w-0")}>
        <div className="my-2 text-center">Dashboard</div>
        <ul className="w-fit">
          {[
            { text: "Coworking-Space", href: "/dashboard/coworking-space" },
            { text: "Ban Appeal", href: "/dashboard/banAppeal" },
          ].map(({ text, href }) => (
            <li key={text}>
              <Link
                className={clsx(
                  "inline-block w-full px-4 py-2 whitespace-nowrap transition",
                  pathname.startsWith(href) ? "bg-gray-100" : "hover:bg-gray-50"
                )}
                href={href}
              >
                {text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className={clsx("absolute bottom-0", open ? "right-0" : "-right-8")}>
        <IconButton className="p-4" size="medium" onClick={() => setOpen((prev) => !prev)}>
          {open ?
            <ChevronLeftIcon className="fill-black" width="1rem" height="1rem" />
          : <ChevronRightIcon className="fill-black" width="1rem" height="1rem" />}
        </IconButton>
      </span>
    </div>
  );
}
