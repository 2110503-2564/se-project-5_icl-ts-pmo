"use client";

import { createBanAppealComment } from "@/libs/banAppeal";
import { Button, TextField } from "@mui/material";
import { useActionState, useEffect } from "react";

export default function CommentForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(createBanAppealComment, undefined);
  useEffect(() => {
    console.log(state);
  }, [state]);
  return (
    <form className="flex w-full items-center gap-2" action={action}>
      <input type="text" name="banAppeal" value={id} hidden readOnly />
      <TextField
        name="text"
        placeholder="Comment something..."
        variant="standard"
        className="w-full"
        error={!!state?.error?.fieldErrors.text}
        helperText={state?.error?.fieldErrors.text?.join() || null}
        defaultValue={state?.data?.text || null}
      />
      <Button className="w-fit" variant="contained" type="submit" disabled={pending}>
        Comment
      </Button>
    </form>
  );
}
