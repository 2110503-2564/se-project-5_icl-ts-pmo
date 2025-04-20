"use client";

export default function DateCell({ createdAt, endDate }: { createdAt: Date; endDate: Date }) {
  return (
    <div className="flex w-fit flex-col gap-1">
      <span>Issue At: {createdAt.toLocaleString()}</span>
      <span>End At: {endDate.toLocaleString()}</span>
    </div>
  );
}
