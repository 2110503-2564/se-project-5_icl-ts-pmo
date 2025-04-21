"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Fade from "@mui/material/Fade";
import { SnackbarCloseReason, SnackbarProps, Snackbar as MuiSnackbar } from "@mui/material";

export const SnackpackStateContext = createContext<
  [readonly SnackbarProps[], React.Dispatch<React.SetStateAction<readonly SnackbarProps[]>>] | null
>(null);

export function useSnackpackContext() {
  const snackPackContext = useContext(SnackpackStateContext);
  if (!snackPackContext) throw new Error("Use a snackpack provider");
  return snackPackContext;
}

export default function SnackbarProvider({ children }: { children: Readonly<React.ReactNode> }) {
  const snackPackState = useState<Readonly<SnackbarProps[]>>([]);
  const [snackPack, setSnackPack] = snackPackState;
  const [info, setInfo] = useState<SnackbarProps | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (snackPack.length && !info) {
      // Set a new snack when we don't have an active one
      setInfo(snackPack[0]);
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && info && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, setSnackPack, info, open]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason !== "clickaway") setOpen(false);
  };
  const handleExited = () => setInfo(undefined);

  return (
    <>
      <SnackpackStateContext.Provider value={snackPackState}>{children}</SnackpackStateContext.Provider>
      <MuiSnackbar
        {...{ ...info, key: undefined }}
        // anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        key={info?.key}
        open={open}
        onClose={handleClose}
        slots={{ transition: Fade }}
        slotProps={{ transition: { onExited: handleExited } }}
        autoHideDuration={3000}
      />
    </>
  );
}
