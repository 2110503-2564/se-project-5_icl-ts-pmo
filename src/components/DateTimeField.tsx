"use client";

import { useState } from "react";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

export default function DateTimeField({
  name,
  label,
  defaultValue,
  helperText,
  minDateTime,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  helperText?: string | null;
  minDateTime?: Date | undefined;
}) {
  const [date, setDate] = useState<Dayjs | null>((defaultValue && dayjs(defaultValue)) || null);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  return (
    <>
      <input type="text" name={name} value={date?.toISOString() || ""} hidden readOnly />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label={label}
          value={date}
          onChange={(value) => setDate(value)}
          slotProps={{ textField: { helperText, error: !!helperText } }}
          minDateTime={minDateTime? dayjs.tz(minDateTime, dayjs.tz.guess()) : undefined}
        />
      </LocalizationProvider>
    </>
  );
}
