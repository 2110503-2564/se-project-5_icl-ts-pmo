import { auth } from "@/auth";
import BanIssueTable from "./BanIssueTable";

export default async function BanIssues({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session) return <main>You are not logged in</main>;

  return (
    <main className="p-4">
      <h1>Ban Issues</h1>
      <BanIssueTable searchParams={await searchParams} session={session} />
    </main>
  );
}
