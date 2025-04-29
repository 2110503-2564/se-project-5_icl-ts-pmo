"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { InputAdornment, TextField, TextFieldProps, TextFieldVariants } from "@mui/material";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchFieldSP<Variant extends TextFieldVariants>({
  search,
  props,
}: {
  search: string;
  props?: { variant?: Variant } & Omit<TextFieldProps, "variant">;
}) {
  const [pathname, searchParams] = [usePathname(), useSearchParams()];
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((value: string) => {
    if (value == search) return;
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
      params.delete("page");
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 234);

  return (
    <TextField
      className="w-md"
      variant="outlined"
      placeholder="Search..."
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <MagnifyingGlassIcon width="1rem" height="1rem" />
            </InputAdornment>
          ),
        },
      }}
      {...props}
      defaultValue={search}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
