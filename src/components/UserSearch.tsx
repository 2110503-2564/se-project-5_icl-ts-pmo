"use client";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { getUserList } from "@/libs/auth";
import { UserType } from "@/libs/db/models/User";

export default function UserSearch({ name, label }: { name: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleChange = useDebouncedCallback((email: string) => {
    setEmail(email);
    (async () => {
      setLoading(true);
      const users = await getUserList({ email: { $regex: email } }, { sort: { name: 1 }, limit: 5 });
      setLoading(false);
      setOptions(users.data || []);
    })();
  }, 300);

  const handleOpen = () => {
    setOpen(true);
    handleChange(email);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setOptions([]);
  };

  return (
    <Autocomplete
      sx={{ width: 300 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => option.email}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          onChange={(e) => {
            if (email != e.currentTarget.value) {
              handleChange(e.currentTarget.value);
            }
          }}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
