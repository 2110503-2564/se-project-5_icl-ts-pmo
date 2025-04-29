import { getCoworkingSpace } from "@/libs/coworkingSpace";
import EditCoworkingSpaceForm from "./Form";
import { authLoggedIn } from "@/utils";

export default async function EditCoworkingSpace({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, authLoggedIn("/")]);
  const coworkingSpace = await getCoworkingSpace(id);
  if (!coworkingSpace.success) return <main>Cannot fetch data</main>;

  return (
    <main className="p-4">
      <h1>Edit Coworking Spaces</h1>
      <EditCoworkingSpaceForm coworkingSpace={coworkingSpace.data} />
    </main>
  );
}
