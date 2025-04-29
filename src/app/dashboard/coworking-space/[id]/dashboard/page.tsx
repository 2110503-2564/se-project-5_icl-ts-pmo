import { getCoworkingSpace } from "@/libs/coworkingSpace";
import { getCoworkingSpaceFrequency } from "@/libs/coworkingSpace";
import { getCoworkingSpaceTotalReservation } from "@/libs/coworkingSpace";
import { authLoggedIn } from "@/utils";
import { Button } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { clsx } from "clsx";

export default async function CoworkingSpaceDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await authLoggedIn(`/dashboard/coworking-space/${id}/dashboard`);
  const response = await getCoworkingSpace(id);
  if (!response.success) return <main>Cannot fetch data</main>;
  const { data: coworkingSpace } = response;
  const [status, frequency] = await Promise.all([
    getCoworkingSpaceTotalReservation(id, session),
    getCoworkingSpaceFrequency(id, session),
  ]);

  return (
    <main>
      <h1>{coworkingSpace.name}&lsquo;s Dashboard</h1>
      <section className="rounded-lg border-2 shadow-xl">
        <h2 className="mb-4 text-center text-xl font-bold">Past Approval Status</h2>
        {status.success ?
          <div className="mx-auto flex w-fit flex-col items-center gap-2 py-2">
            <div className="flex flex-row gap-10">
              {(["approved", "pending", "rejected", "canceled"] as const).map((e) => (
                <div className="flex flex-row font-bold" key={e}>
                  <div
                    className={clsx(
                      "mr-[5px] h-[35px] w-[130px] rounded-full pt-[6px] text-center",
                      e == "pending" && "bg-amber-300",
                      e == "canceled" && "bg-red-300",
                      e == "rejected" && "bg-red-500",
                      e == "approved" && "bg-green-500"
                    )}
                  >
                    {e}
                  </div>
                  <div className="pt-[6px]">: {status.data[e]}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-row font-bold">
              <div className="mr-[5px] h-[35px] w-[130px] rounded-full bg-gray-500 pt-[6px] text-center">
                Total
              </div>
              <div className="pt-[6px]">: {status.data.total}</div>
            </div>
            <div className="mt-5 mb-6 flex flex-row font-bold">
              <Button variant="contained" href={`/dashboard/coworking-space/${id}`}>
                Manage Reservation
              </Button>
            </div>
          </div>
        : <div className="text-center">Cannot fetch data</div>}
      </section>
      <section>
        {frequency.data ?
          <BarChart
            height={300}
            xAxis={[{ label: "time", scaleType: "band", data: frequency.data.label }]}
            series={frequency.data.data.map((e) => ({
              label: e.label,
              data: e.data,
              stack: "status",
              color:
                e.label == "Approved" ? "#00c951"
                : e.label == "Pending" ? "#ffd230"
                : e.label == "Rejected" ? "#fb2c36"
                : "#ffa2a2",
            }))}
          />
        : <div>Cannot fetch data</div>}
      </section>
    </main>
  );
}
