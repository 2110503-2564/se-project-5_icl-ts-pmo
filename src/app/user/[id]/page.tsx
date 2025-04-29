import { Button } from "@mui/material";
import { getUser, userLogout } from "@/libs/auth";
import AvatarIcon from "@/components/AvatarIcon";
import UserDetail from "./userDetail";
import { auth } from "@/auth";
import Link from "next/link";

export default async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const response = await getUser(id);
  if (!response.success) return <main>Cannot fetch User</main>;

  return (
    <main className="p-4">
      <h1>Profile</h1>
      <div className="mx-auto mt-4 mb-12 flex w-[650px] flex-col items-center gap-8 rounded-xl border py-4 pb-16 shadow-2xl">
        <div className="flex flex-col gap-2">
          <AvatarIcon
            props={{ sx: { width: 150, height: 150, fontSize: "6rem" } }}
            name={response.data.name}
          />
          <span className="text-center text-3xl">{response.data.name}</span>
        </div>
        <UserDetail
          phone={response.data.phone}
          email={response.data.email}
          since={new Date(response.data.createdAt)}
        />
        <div className="flex items-center justify-center gap-4">
          <Link href={`/user/${id}/banHistory`}>
            <Button color="primary" variant="contained">
              View Ban History
            </Button>
          </Link>
          {session && session.user._id == id && (
            <form action={userLogout.bind(undefined, "/profile")}>
              <Button type="submit" color="error" variant="contained">
                Logout
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
