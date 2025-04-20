"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createBanAppeal } from "@/libs/banAppeal";
import { checkBanIssue } from "@/libs/api/checkBan";

export default function CreateBanAppeal() {
  const [state, action, pending] = useActionState(createBanAppeal, undefined);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/banIssue/${state.data.banIssue}/${state.data._id}`);
    }
  }, [state, router]);

  const [isBanned, setBanned] = useState<boolean|undefined>(undefined);
  useEffect(() => {
    if(id){
      checkBanIssue(id.toString()).then((e) => {
        if(e.success){
          setBanned(e.isBanned);
        }
      });
    }
  });

  return (
    <main className="p-4">
      <h1 className="text-center text-2xl font-bold mb-1">Make an appeal</h1>
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
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
          { isBanned? 
          <Button variant="contained" type="submit" disabled={pending}>
            Make an appeal
          </Button>
          :
          <div className="text-center font-semibold text-lg text-green-600">Already Resolved</div>
          }
          {state?.message && <span>{state.message}</span>}
        </form>
        <Link className="flex items-center gap-4" href={`/banIssue/${id}`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Ban Issue</span>
        </Link>
      </div>
    </main>
  );
}
