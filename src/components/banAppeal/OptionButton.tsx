import EllipsisHorizontalIcon from "@heroicons/react/24/outline/EllipsisHorizontalIcon";
import Menu, { LinkItem, ActionItem } from "../Menu";
import IconButton from "@mui/material/IconButton";

export default function BanAppealOptionButton({
  banIssueID,
  banAppealID,
  viewInfo,
  edit,
}: {
  banIssueID: string;
  banAppealID: string;
  viewInfo?: boolean;
  edit?: {
    approve?: boolean;
    deny?: boolean;
    action: React.FormHTMLAttributes<HTMLFormElement>["action"];
    pending?: boolean;
  };
}) {
  return (
    <Menu
      buttonChildren={
        <IconButton size="small">
          <EllipsisHorizontalIcon width="1rem" height="1rem" />
        </IconButton>
      }
    >
      {viewInfo && <LinkItem href={`/banIssue/${banIssueID}/${banAppealID}`} text="View Info" />}
      {edit
        && [
          ...(edit.approve ? [{ text: "Approve", status: "resolved" }] : []),
          ...(edit.deny ? [{ text: "Deny", status: "denied" }] : []),
        ].map(({ text, status }) => (
          <ActionItem action={edit.action} key={text} pending={edit.pending} text={text}>
            <input type="text" name="id" value={banIssueID} hidden readOnly />
            <input type="text" name="appeal" value={banAppealID} hidden readOnly />
            <input type="text" name="status" value={status} hidden readOnly />
          </ActionItem>
        ))}
    </Menu>
  );
}
