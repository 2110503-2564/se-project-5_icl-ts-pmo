import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getReservation } from "@/libs/reservations";
import { concatAddress } from "@/utils";
import DetailBody from "./DetailBody";

export default async function Reservation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await getReservation(id);
  if (!response.data) return <main>{response.message || "Cannot fetch data"}</main>;

  const { data: reservation } = response;
  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  return (
    <main className="p-4">
      <div className="mx-auto max-w-5xl rounded-3xl border p-8">
        <div className="mb-8 flex w-full gap-8">
          <Image
            className="w-[50%] rounded-lg"
            src={reservation.coworkingSpace.picture || "/img/BOT-learning-center.jpg"}
            alt="CoworkingSpace Image"
            width={0}
            height={0}
            sizes="50vw"
            priority
          />
          <div>
            <h1 className="!text-left font-bold">{reservation.coworkingSpace.name}</h1>
            <DetailBody
              startDate={startDate}
              endDate={endDate}
              address={concatAddress(reservation.coworkingSpace)}
            ></DetailBody>
          </div>
        </div>
        <Link className="flex items-center gap-4" href={`/reservations`}>
          <ArrowLeftIcon width="1rem" height="1rem" strokeWidth="0.125rem" />
          <span>View Reservations</span>
        </Link>
      </div>
    </main>
  );
}
