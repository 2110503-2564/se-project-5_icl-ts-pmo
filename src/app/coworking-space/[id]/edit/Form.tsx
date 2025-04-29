"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { editCoworkingSpace } from "@/libs/coworkingSpace";
import TimeField from "@/components/TimeField";
import { CoworkingSpaceType } from "@/libs/types";

export default function EditCoworkingSpaceForm({ coworkingSpace }: { coworkingSpace: CoworkingSpaceType }) {
  const [state, action, pending] = useActionState(editCoworkingSpace, undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [src, setSrc] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(`/coworking-space/${coworkingSpace._id}`);
    }
  }, [state, router, coworkingSpace]);

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border p-8">
      <form className="mb-8 flex w-full gap-8" action={action}>
        <input type="text" name="id" value={coworkingSpace._id} hidden readOnly />
        <Image
          className="w-[50%] rounded-lg object-cover"
          src={src ? src : "/img/BOT-learning-center.jpg"}
          alt="CoworkingSpace Image"
          width={0}
          height={0}
          sizes="50vw"
          priority
        />
        <div className="flex flex-col gap-4">
          {(["name", "description", "tel"] as const).map((e) => (
            <TextField
              className="w-full"
              key={e}
              name={e}
              label={e.charAt(0).toUpperCase() + e.slice(1)}
              variant="standard"
              error={!!state?.error?.fieldErrors[e]}
              helperText={state?.error?.fieldErrors[e] ? state?.error?.fieldErrors[e].join() : null}
              defaultValue={state?.data && state.data[e] ? state.data[e].toString() : coworkingSpace[e]}
            />
          ))}
          {(
            [
              { name: "openTime", label: "Open Time" },
              { name: "closeTime", label: "Close Time" },
            ] as const
          ).map(({ name, label }) => (
            <TimeField
              key={name}
              name={name}
              label={label}
              helperText={state?.error?.fieldErrors[name]?.join() || undefined}
              defaultValue={
                (state?.data && state.data[name] && new Date(state.data[name].toString()))
                || new Date(coworkingSpace[name])
              }
            />
          ))}
          <Button variant="contained" disabled={pending} type="submit">
            Edit
          </Button>
        </div>
      </form>
      <Link className="flex items-center gap-4" href={`/dashboard`}>
        <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}
