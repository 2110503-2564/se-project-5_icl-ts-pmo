import clsx from "clsx";

export function BanIssueStatus({ isResolved }: { isResolved: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
          isResolved ? "bg-green-500" : "bg-red-500"
        )}
      ></span>
      <span>{isResolved ? "Resolved" : "Not Resolved"}</span>
    </div>
  );
}

export function BanIssueDateCell({ createdAt, endDate }: { createdAt: Date; endDate: Date }) {
  return (
    <div className="flex w-fit flex-col gap-1">
      <span>Issue At: {createdAt.toLocaleString()}</span>
      <span>End At: {endDate.toLocaleString()}</span>
    </div>
  );
}
