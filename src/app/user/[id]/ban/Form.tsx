"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { createBanIssue } from "@/libs/banIssue";
import DateTimeField from "@/components/DateTimeField";

export default function UserBanForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(createBanIssue, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/banIssue/${state.data._id}`);
    }
  }, [state, router]);

  return (
    <form className="mb-8 flex w-full flex-col gap-8" action={action}>
      <input type="text" name="id" value={id} hidden readOnly />
      {(["title", "description"] as const).map((e) => (
        <TextField
          key={e}
          name={e}
          label={e.charAt(0).toUpperCase() + e.slice(1)}
          variant="standard"
          className="w-full font-bold"
          error={!!state?.error?.fieldErrors[e]}
          helperText={state?.error?.fieldErrors[e]?.join() || null}
          defaultValue={(state?.data && state.data[e]) || null}
          required
        />
      ))}
      <DateTimeField
        name="endDate"
        label="End Date"
        helperText={state?.error?.fieldErrors.endDate?.join() || null}
        defaultValue={state?.data?.endDate.toString() || null}
        minDateTime={new Date(Date.now())}
      />
      <Button variant="contained" type="submit" disabled={pending}>
        Issue Ban
      </Button>
      {state?.message && <div className="w-full text-center text-red-600">{state.message}</div>}
    </form>
  );
}
