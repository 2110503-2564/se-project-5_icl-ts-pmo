"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { createCoworkingSpace } from "@/libs/coworkingSpace";
import TimeField from "@/components/TimeField";
import AddressField from "./ProvinceField";

export default function CreateCoworkingSpaceForm() {
  const [state, action, pending] = useActionState(createCoworkingSpace, undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [src, setSrc] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(`/dashboard/coworking-ppace/${state.data?._id}`);
    }
  }, [state, router]);

  return (
    <form className="mb-8 flex w-full gap-8" action={action}>
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
        {(["name", "description", "tel", "address"] as const).map((e) => (
          <TextField
            key={e}
            name={e}
            label={e.charAt(0).toUpperCase() + e.slice(1)}
            variant="standard"
            className="w-full rounded font-bold"
            error={!!state?.error?.fieldErrors[e]}
            helperText={state?.error?.fieldErrors[e]?.join() || null}
            defaultValue={(state?.data && state?.data[e]) || null}
          />
        ))}
        <AddressField />
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
              (state?.data && state.data[name] && new Date(state.data[name].toString())) || undefined
            }
          />
        ))}
        <Button variant="contained" disabled={pending} type="submit">
          Submit
        </Button>
        {state?.error?.formErrors && <span>{state.error.formErrors.join()}</span>}
      </div>
    </form>
  );
}
