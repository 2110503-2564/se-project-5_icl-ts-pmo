"use client";

import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import provinceData from "@/province";
import { createCoworkingSpace } from "@/libs/coworkingSpace";

// * Refactor These Spaghetti Code
export default function AddressField({
  state,
}: {
  state?: Awaited<ReturnType<typeof createCoworkingSpace>>;
}) {
  const province = (state?.data && provinceData.find((e) => e.name == state.data.name)) || null;
  const amphure = (province && province.amphure.find((e) => e.name == state?.data?.district)) || null;
  const tambon = (amphure && amphure.tambon.find((e) => e.name == state?.data?.subDistrict)) || null;
  const [selected, setSelected] = useState({ province, amphure, tambon });

  return (
    <>
      <Autocomplete
        options={provinceData}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.name}
        value={selected.province || null}
        onChange={(_, value) => setSelected({ province: value, amphure: null, tambon: null })}
        renderInput={(params) => (
          <TextField
            {...params}
            name="province"
            label="Province"
            error={!!state?.error?.fieldErrors.province}
            helperText={state?.error?.fieldErrors.province?.join() || null}
          />
        )}
      />
      <Autocomplete
        disabled={!selected.province}
        options={selected.province?.amphure || []}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.name}
        value={selected.amphure || null}
        onChange={(_, value) => setSelected({ province: selected.province, amphure: value, tambon: null })}
        renderInput={(params) => (
          <TextField
            {...params}
            name="district"
            label="District"
            error={!!state?.error?.fieldErrors.district}
            helperText={state?.error?.fieldErrors.district?.join() || null}
          />
        )}
      />
      <Autocomplete
        disabled={!selected.amphure}
        options={selected.amphure?.tambon || []}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.name}
        value={selected.tambon || null}
        onChange={(_, value) => setSelected({ ...selected, tambon: value })}
        renderInput={(params) => (
          <TextField
            {...params}
            name="subDistrict"
            label="Sub-District"
            error={!!state?.error?.fieldErrors.subDistrict}
            helperText={state?.error?.fieldErrors.subDistrict?.join() || null}
          />
        )}
      />
      <TextField
        variant="outlined"
        name="postalcode"
        label="Postal Code"
        value={selected.tambon?.postalCode || ""}
        error={!!state?.error?.fieldErrors.postalcode}
        helperText={state?.error?.fieldErrors.postalcode?.join() || null}
        slotProps={{ input: { readOnly: true } }}
      />
    </>
  );
}
