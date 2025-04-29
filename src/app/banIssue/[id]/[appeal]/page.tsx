import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getBanAppeal, updateBanAppeal } from "@/libs/banAppeal";
import AvatarIcon from "@/components/AvatarIcon";
import CommentForm from "./CommentForm";
import { BanIssueStatus } from "@/components/banIssue/TableBodyCell";
import { AppealStatus } from "@/components/banAppeal/TableBodyCell";
import BanAppealOptionButton from "@/components/banAppeal/OptionButton";
import { authLoggedIn } from "@/utils";

export default async function BanAppeal({ params }: { params: Promise<{ id: string; appeal: string }> }) {
  const { id, appeal } = await params;
  const session = await authLoggedIn(`/banIssue/${id}/${appeal}`);
  const response = await getBanAppeal(id, appeal, session);
  if (!response.success) return <main>Cannot fetch data</main>;
  const { data: banAppeal } = response;

  const { banIssue } = banAppeal;
  const createdAt = new Date(banIssue.createdAt);
  const endDate = new Date(banIssue.endDate);

  return (
    <main className="p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl border p-8">
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="!text-left">{banIssue.title}</h1>
              <div className="flex items-center gap-2">
                <BanIssueStatus isResolved={banIssue.isResolved} />
                {session.user.role == "admin" && banAppeal.resolveStatus == "pending" && (
                  <BanAppealOptionButton
                    banIssueID={id}
                    banAppealID={appeal}
                    edit={{
                      approve: true,
                      deny: true,
                      action: async (e) => {
                        "use server";
                        await updateBanAppeal(undefined, e);
                      },
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex w-fit gap-4">
              <span>Issue At: {createdAt.toLocaleString()}</span>
              <span>End At: {endDate.toLocaleString()}</span>
            </div>
            <span>Ban Description: {banIssue.description}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-8">
              <h2 className="text-xl font-bold">Ban Appeal</h2>
              <AppealStatus resolveStatus={banAppeal.resolveStatus} />
            </div>
            <span>Appeal description: {banAppeal.description}</span>
          </div>
        </div>
        <section>
          <h2 className="text-xl font-bold">Comments</h2>
          <CommentForm id={id} appeal={appeal} />
          {banAppeal.comment.map((e) => (
            <div className="flex items-start gap-2" key={e._id}>
              <span className="mt-2">
                <AvatarIcon name={e.user.name} />
              </span>
              <div className="flex flex-col">
                <span>{e.user.name}</span>
                <span>{e.text}</span>
              </div>
            </div>
          ))}
        </section>
        <Link className="flex items-center gap-4" href={`/banIssue/${banIssue._id}`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Ban Issue</span>
        </Link>
      </div>
    </main>
  );
}
