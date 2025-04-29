"use client";

import { useActionState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { createBanAppeal } from "@/libs/banAppeal";

export default function CreateAppealForm() {
  const [state, action, pending] = useActionState(createBanAppeal, undefined);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/banIssue/${state.data.banIssue}/${state.data._id}`);
    }
  }, [state, router]);

  return (
    <form className="mb-8 flex w-full flex-col gap-8" action={action}>
      <input type="text" name="banIssue" value={id} hidden readOnly />
      <TextField
        name="description"
        label="Appeal Description"
        variant="standard"
        className="w-full font-bold"
        error={!!state?.error?.fieldErrors.description}
        helperText={state?.error?.fieldErrors.description?.join() || null}
        defaultValue={state?.data?.description || null}
        multiline
      />
      <Button variant="contained" type="submit" disabled={pending}>
        Make an appeal
      </Button>
      {state?.message && <span>{state.message}</span>}
    </form>
  );
}
