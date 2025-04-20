import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import AvatarMenu from "./AvatarMenu";

export default async function TopMenu() {
  const session = await auth();

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
        <Link href="/coworking-space" className="hover:text-gray-600">Co-working Space</Link>
        <Link href="/reservations" className="hover:text-gray-600">Reservations</Link>
      </div>
      <div className="flex items-center gap-4 pr-4">
        <AvatarMenu session={session} />
      </div>
    </nav>
  );
}
