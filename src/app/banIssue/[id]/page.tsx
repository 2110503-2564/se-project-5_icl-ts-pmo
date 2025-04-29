import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getBanIssue, resolveBanIssue } from "@/libs/banIssue";
import AvatarIcon from "@/components/AvatarIcon";
import clsx from "clsx";
import { Button } from "@mui/material";
import { BanIssueStatus } from "@/components/banIssue/TableBodyCell";
import BanIssueOptionButton from "@/components/banIssue/OptionButton";
import { authLoggedIn } from "@/utils";

export default async function BanIssue({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await authLoggedIn(`/banIssue/${id}`);
  const response = await getBanIssue(id, session);
  if (!response.success) return <main>Cannot fetch data</main>;

  const { banIssue, banAppeals } = response.data;
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
                {session.user.role == "admin" && !banIssue.isResolved && (
                  <BanIssueOptionButton
                    id={banIssue._id}
                    resolve={{
                      action: async (e) => {
                        "use server";
                        await resolveBanIssue(undefined, e);
                      },
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-8">
              {[
                { text: "Issuer: ", name: banIssue.admin.name },
                { text: "Target: ", name: banIssue.user.name },
              ].map(({ text, name }) => (
                <div className="flex items-center gap-2 rounded border px-4 py-2" key={text}>
                  <span>{text}</span>
                  <AvatarIcon
                    name={name}
                    props={{ sx: { width: "1.25rem", height: "1.25rem", fontSize: "0.75rem" } }}
                  />
                  <span>{name}</span>
                </div>
              ))}
            </div>
            <div className="flex w-fit gap-4">
              <span>Issue At: {createdAt.toLocaleString()}</span>
              <span>End At: {endDate.toLocaleString()}</span>
            </div>
          </div>
          <span>Description: {banIssue.description}</span>
        </div>
        <section>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Appeals</h2>
            {session.user._id == banIssue.user._id && (
              <Link href={`/banIssue/${id}/appeal`}>
                <Button type="submit" color="primary" variant="text" size="small">
                  + New
                </Button>
              </Link>
            )}
          </div>
          {banAppeals.map((e, index) => (
            <Link href={`/banIssue/${id}/${e._id}`} key={e._id}>
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
                    e.resolveStatus == "pending" && "bg-amber-300",
                    e.resolveStatus == "denied" && "bg-red-500",
                    e.resolveStatus == "resolved" && "bg-green-500"
                  )}
                ></span>
                <span>
                  #{index + 1}: {e.description}
                </span>
              </div>
            </Link>
          ))}
        </section>
        <Link className="flex items-center gap-4" href={`/banIssue`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Ban Issues</span>
        </Link>
      </div>
    </main>
  );
}
