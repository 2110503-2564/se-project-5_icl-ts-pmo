import { AvatarProps } from "@mui/material";
import AvatarIcon from "./AvatarIcon";
import Link from "next/link";
import { UserType } from "@/libs/types";

export default function UserInfo({
  avatarIconProps,
  user,
  name,
  email,
}: {
  user: UserType;
  name?: boolean;
  email?: boolean;
  avatarIconProps?: AvatarProps;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link href={`/user/${user._id}`}>
        <AvatarIcon props={avatarIconProps} name={user.name} />
      </Link>
      <div className="flex flex-col gap-1">
        {name && <span>{user.name}</span>}
        {email && <span>{user.email}</span>}
      </div>
    </div>
  );
}
