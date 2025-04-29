import EllipsisHorizontalIcon from "@heroicons/react/24/outline/EllipsisHorizontalIcon";
import Menu, { ActionItem, LinkItem } from "../Menu";
import IconButton from "@mui/material/IconButton";

export default function ReservationOptionButton({
  id,
  viewInfo,
  edit,
  deleteOption,
}: {
  id: string;
  viewInfo?: boolean;
  edit?: {
    cancel?: boolean;
    approve?: boolean;
    reject?: boolean;
    action: React.FormHTMLAttributes<HTMLFormElement>["action"];
    pending?: boolean;
  };
  deleteOption?: { action?: React.FormHTMLAttributes<HTMLFormElement>["action"]; pending?: boolean };
}) {
  return (
    <Menu
      buttonChildren={
        <IconButton size="small">
          <EllipsisHorizontalIcon width="1rem" height="1rem" />
        </IconButton>
      }
    >
      {viewInfo && <LinkItem text="View Info" href={`/reservations/${id}`} />}
      {edit
        && [
          ...(edit.cancel ? [{ text: "Cancel", status: "canceled" }] : []),
          ...(edit.approve ? [{ text: "Approve", status: "approved" }] : []),
          ...(edit.reject ? [{ text: "Reject", status: "rejected" }] : []),
        ].map(({ text, status }) => (
          <ActionItem action={edit.action} text={text} pending={edit.pending} key={text}>
            <input type="text" name="id" value={id} hidden readOnly />
            {status && <input type="text" name="approvalStatus" value={status} hidden readOnly />}
          </ActionItem>
        ))}
      {deleteOption && (
        <ActionItem action={deleteOption.action} text="Delete" pending={deleteOption.pending}>
          <input type="text" name="id" value={id} hidden readOnly />
        </ActionItem>
      )}
    </Menu>
  );
}
