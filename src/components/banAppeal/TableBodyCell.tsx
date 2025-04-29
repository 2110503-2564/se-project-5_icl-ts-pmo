import { BanAppealType } from "@/libs/types";
import clsx from "clsx";

export function AppealStatus({ resolveStatus }: { resolveStatus: BanAppealType["resolveStatus"] }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          "inline-block aspect-square h-2 w-2 justify-self-center rounded-full",
          resolveStatus == "pending" && "bg-amber-300",
          resolveStatus == "denied" && "bg-red-500",
          resolveStatus == "resolved" && "bg-green-500"
        )}
      ></span>
      <span>{resolveStatus}</span>
    </div>
  );
}
