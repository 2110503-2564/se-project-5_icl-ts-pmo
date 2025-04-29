import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CreateCoworkingSpaceForm from "./Form";
import { authLoggedIn } from "@/utils";

export default async function CreateCoworkingSpace() {
  await authLoggedIn("/dashboard/coworking-space/create");

  return (
    <main className="p-4">
      <h1 className="text-center text-2xl font-bold">Create Coworking Spaces</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <CreateCoworkingSpaceForm />
        <Link className="flex items-center gap-4" href={`/coworking-space`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Coworking-Spaces</span>
        </Link>
      </div>
    </main>
  );
}
