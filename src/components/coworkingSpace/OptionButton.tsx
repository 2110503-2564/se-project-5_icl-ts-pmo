import EllipsisHorizontalIcon from "@heroicons/react/24/outline/EllipsisHorizontalIcon";
import Menu, { ActionItem, LinkItem } from "../Menu";
import { deleteCoworkingSpace } from "@/libs/coworkingSpace";
import IconButton from "@mui/material/IconButton";

export default function CoworkingSpaceOptionButton({
  id,
  viewInfo,
  viewReserve,
  viewDashboard,
  edit,
  deleteOption,
}: {
  id: string;
  viewInfo?: boolean;
  viewReserve?: boolean;
  viewDashboard?: boolean;
  edit?: boolean;
  deleteOption?: boolean;
}) {
  return (
    <Menu
      buttonChildren={
        <IconButton size="small">
          <EllipsisHorizontalIcon width="1rem" height="1rem" />
        </IconButton>
      }
    >
      {[
        ...(viewInfo ? [{ text: "View Info", href: `/coworking-space/${id}` }] : []),
        ...(viewReserve ? [{ text: "View Reservations", href: `/dashboard/coworking-space/${id}` }] : []),
        ...(viewDashboard ?
          [{ text: "View Dashboard", href: `/dashboard/coworking-space/${id}/dashboard` }]
        : []),
        ...(edit ? [{ text: "Edit", href: `/coworking-space/${id}/edit` }] : []),
      ].map(({ text, href }) => (
        <LinkItem text={text} href={href} key={text} />
      ))}
      {deleteOption && (
        <ActionItem
          action={async () => {
            "use server";
            await deleteCoworkingSpace(id);
          }}
          text="Delete"
        />
      )}
    </Menu>
  );
}
