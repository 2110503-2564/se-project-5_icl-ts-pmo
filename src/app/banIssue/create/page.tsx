"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createBanIssue } from "@/libs/banIssue";
import DateTimeField from "@/components/DateTimeField";
import UserSearch from "@/components/UserSearch";

export default function CreateBanIssue() {
  const [state, action, pending] = useActionState(createBanIssue, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/banIssue/${state.data._id}`);
    }
  }, [state, router]);

  return (
    <main className="p-4">
      <h1 className="text-center text-2xl font-bold">Issue a ban</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <form className="mb-8 flex w-full flex-col gap-8" action={action}>
          <UserSearch name="user" label="Search user" />
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
        <Link className="flex items-center gap-4" href={`/banIssue`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Ban Issues</span>
        </Link>
      </div>
    </main>
  );
}
