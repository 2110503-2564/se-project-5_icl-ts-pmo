"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function FilterDialog() {
  const [pathname, searchParams, { replace }] = [usePathname(), useSearchParams(), useRouter()];
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(searchParams.get("time") || "all");
  const [resolve, setResolve] = useState(searchParams.get("resolve") || "all");

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    if (params.has("time") || params.has("resolve")) {
      params.delete("time");
      params.delete("resolve");
      params.delete("page");
    }
    replace(`${pathname}?${params.toString()}`);
    handleClose();
  };
  const handleSubmit = () => {
    const params = new URLSearchParams(searchParams);
    params.set("time", time);
    params.set("resolve", resolve);
    params.delete("page");
    replace(`${pathname}?${params.toString()}`);
    handleClose();
  };

  return (
    <>
      <IconButton size="small" onClick={handleClickOpen}>
        <AdjustmentsHorizontalIcon width="1rem" height="1rem" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 py-4">
            <FormControl>
              <FormLabel>Time Select</FormLabel>
              <RadioGroup row name="timeFilter" value={time} onChange={(_, value) => setTime(value)}>
                <FormControlLabel value="past" control={<Radio />} label="Past" />
                <FormControlLabel value="current" control={<Radio />} label="Current" />
                <FormControlLabel value="all" control={<Radio />} label="All" />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Resolve</FormLabel>
              <RadioGroup row name="resolveFilter" value={resolve} onChange={(_, value) => setResolve(value)}>
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="all" control={<Radio />} label="All" />
              </RadioGroup>
            </FormControl>
            <Button variant="contained" color="error" onClick={handleClear}>
              Clear Filter
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
