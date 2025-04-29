"use client";

import Image from "next/image";
import Link from "next/link";
import AvatarMenu from "./AvatarMenu";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Session } from "next-auth";

export default function TopMenu({ session }: { session: Session | null }) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 z-30 flex h-12 w-full justify-between bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <Link className="h-full p-1" href="/">
          <Image
            src="/img/logo.jpg"
            className="aspect-square h-full w-auto"
            alt="logo"
            width={0}
            height={0}
            sizes="100vh"
          />
        </Link>
        {[
          { text: "Co-workingSpace", href: "/coworking-space" },
          { text: "Reservations", href: "/reservations" },
        ].map(({ text, href }) => (
          <Link
            className={"group relative rounded px-2 py-1 transition hover:bg-gray-100"}
            href={href}
            key={text}
          >
            {text}
            <div
              className={clsx(
                "absolute bottom-0 h-[1px] bg-black transition-all duration-500",
                pathname.startsWith(href) ? "left-0 w-full" : "left-1/2 w-0"
              )}
            ></div>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4 pr-4">
        <AvatarMenu session={session} />
      </div>
    </nav>
  );
}
