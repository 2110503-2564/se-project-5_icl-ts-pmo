import Link from "next/link";
import clsx from "clsx";
import { auth } from "@/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getBanAppeal, resolveBanAppeal } from "@/libs/banAppeal";
import AvatarIcon from "@/components/AvatarIcon";
import OptionButton from "@/components/OptionButton";
import CommentForm from "./CommentForm";

export default async function BanAppeal({ params }: { params: Promise<{ id: string; appeal: string }> }) {
  const session = await auth();
  if (!session) return <main>You are not logged in</main>;

  const { appeal } = await params;
  const response = await getBanAppeal(appeal);
  if (!response.data) return <main>Cannot fetch data</main>;

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
                <span
                  className={clsx(
                    "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
                    banIssue.isResolved ? "bg-green-500" : "bg-red-500"
                  )}
                ></span>
                <span>{banIssue.isResolved ? "Resolved" : "Not Resolved"}</span>
                {session.user.role == "admin" && banAppeal.resolveStatus == "pending" && (
                  <OptionButton>
                    {[
                      { text: "Approve", action: resolveBanAppeal.bind(undefined, appeal, "resolved") },
                      { text: "Deny", action: resolveBanAppeal.bind(undefined, appeal, "denied") },
                    ].map(({ text, action }) => (
                      <li key={text}>
                        <form
                          action={async () => {
                            "use server";
                            await action();
                          }}
                        >
                          <input type="text" name="id" value={banAppeal._id} hidden readOnly />
                          <button
                            className="w-full cursor-pointer px-4 py-1.5 text-left hover:bg-gray-100"
                            type="submit"
                          >
                            {text}
                          </button>
                        </form>
                      </li>
                    ))}
                  </OptionButton>
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
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
                    banAppeal.resolveStatus == "pending" && "bg-amber-300",
                    banAppeal.resolveStatus == "denied" && "bg-red-500",
                    banAppeal.resolveStatus == "resolved" && "bg-green-500"
                  )}
                ></span>
                <span>{banAppeal.resolveStatus}</span>
              </div>
            </div>
            <span>Appeal description: {banAppeal.description}</span>
          </div>
        </div>
        <section>
          <h2 className="text-xl font-bold">Comments</h2>
          <CommentForm id={appeal} />
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
