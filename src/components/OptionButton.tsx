"use client";

import { useState } from "react";
import { IconButton, Menu } from "@mui/material";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export default function OptionButton({ children }: { children: Readonly<React.ReactNode> }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <IconButton
        onClick={handleClick}
        id="basic-button"
        size="small"
        aria-controls={open ? "basic-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
      >
        <EllipsisHorizontalIcon width="1rem" height="1rem" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        {children}
      </Menu>
    </div>
  );
}
