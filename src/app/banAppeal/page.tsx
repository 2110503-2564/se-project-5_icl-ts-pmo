import { auth } from "@/auth";
import BanAppealTable from "./BanAppealTable";

export default async function BanAppeals({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session) return <main>You are not logged in</main>;

  return (
    <main className="p-4">
      <h1>Ban Appeal</h1>
      <BanAppealTable searchParams={await searchParams} session={session} />
    </main>
  );
}
