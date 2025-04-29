import { authLoggedIn } from "@/utils";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import Link from "next/link";
import CreateAppealForm from "./Form";

export default async function CreateAppeal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await authLoggedIn(`/banIssue/${id}/appeal`);

  return (
    <main className="p-4">
      <h1 className="mb-1 text-center text-2xl font-bold">Make an appeal</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <CreateAppealForm />
        <Link className="flex items-center gap-4" href={`/banIssue/${id}`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Ban Issue</span>
        </Link>
      </div>
    </main>
  );
}
