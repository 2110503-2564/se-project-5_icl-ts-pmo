"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CWS } from "@/libs/db/models/CoworkingSpace";
import { ReservationType } from "@/libs/db/models/Reservation";
import { updateReservationStatus } from "@/libs/reservations";
import DateTimeField from "@/components/DateTimeField";

export default function EditReservationForm({
  reservation,
}: {
  reservation: Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CWS };
}) {
  const [state, action, pending] = useActionState(updateReservationStatus, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(`/reservations/${reservation._id}`);
    }
  }, [state, router, reservation._id]);

  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border p-8">
      <form className="mb-8 flex w-full gap-8" action={action}>
        <input type="text" name="id" value={reservation._id} hidden readOnly />
        <Image
          className="w-[50%] rounded-lg object-cover"
          src={reservation.coworkingSpace.picture || "/img/BOT-learning-center.jpg"}
          alt="CoworkingSpace Image"
          width={0}
          height={0}
          sizes="50vw"
          priority
        />
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{reservation.coworkingSpace.name}</h2>
          <TextField
            type="number"
            name="personCount"
            label="Person Count"
            variant="outlined"
            defaultValue={reservation.personCount}
          />
          <DateTimeField name="startDate" defaultValue={startDate.toISOString()} />
          <DateTimeField name="endDate" defaultValue={endDate.toISOString()} />
          <Button type="submit" variant="contained" disabled={pending}>
            Edit
          </Button>
        </div>
      </form>
      <Link className="flex items-center gap-4" href={`/reservations`}>
        <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
        <span>View Reservation</span>
      </Link>
    </div>
  );
}
