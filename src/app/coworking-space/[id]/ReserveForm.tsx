"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { createReservation } from "@/libs/reservations";
import DateTimeField from "@/components/DateTimeField";

export default function ReserveForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(createReservation, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(`/reservations/${state.data?._id}`);
    }
  }, [state, router]);
  return (
    <form className="flex flex-col items-center gap-4 p-4" action={action}>
      <input type="text" name="coworkingSpace" value={id} hidden readOnly />
      <TextField
        type="number"
        name="personCount"
        label="Person Count"
        variant="outlined"
        error={!!state?.error?.fieldErrors.personCount}
        defaultValue={state?.data?.personCount.toString() || null}
        helperText={state?.error?.fieldErrors.personCount?.join()}
      />
      <div className="flex items-center justify-center gap-4">
        <DateTimeField
          name="startDate"
          label="Start Date"
          defaultValue={state?.data?.startDate.toString() || null}
          helperText={state?.error?.fieldErrors.startDate?.join()}
        />
        <DateTimeField
          name="endDate"
          label="End Date"
          defaultValue={state?.data?.endDate.toString() || null}
          helperText={state?.error?.fieldErrors.endDate?.join()}
        />
      </div>
      {state?.message && <span>{state.message}</span>}
      <Button type="submit" variant="contained" disabled={pending}>
        Reserve
      </Button>
    </form>
  );
}
