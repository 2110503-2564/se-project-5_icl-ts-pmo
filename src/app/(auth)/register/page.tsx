"use client";

import { Suspense, useActionState } from "react";
import { Button, TextField } from "@mui/material";
import { userRegister } from "@/libs/auth";
import PasswordField from "../PasswordField";
import RedirectToInput from "../RedirectToInput";
import LinkWithCallback from "../LinkWithCallback";

export default function Register() {
  const [state, action, pending] = useActionState(userRegister, undefined);

  return (
    <main className="flex flex-col items-center gap-4 p-4">
      <Suspense>
        <div className="h-fit w-fit rounded border p-8">
          <h1>Register</h1>
          <form className="flex flex-col items-center gap-4 py-4" action={action}>
            <RedirectToInput />
            {(["name", "email", "phone"] as const).map((e, index) => (
              <TextField
                className="w-full"
                key={e}
                id={e}
                name={e}
                label={e.charAt(0).toUpperCase() + e.slice(1)}
                variant="filled"
                error={!!state?.error?.fieldErrors[e]}
                helperText={state?.error?.fieldErrors[e]?.join()}
                defaultValue={state?.data ? state.data[e].toString() : null}
                autoFocus={index == 0}
                required
              />
            ))}
            <PasswordField
              props={{
                name: "password",
                error: !!state?.error?.fieldErrors.password,
                defaultValue: state?.data ? state.data.password.toString() : null,
              }}
              helperText={state?.error?.fieldErrors.password?.join()}
            />
            <Button className="w-full" type="submit" variant="contained" disabled={pending}>
              Register
            </Button>
            {state?.message && <span>{state.message}</span>}
          </form>
        </div>
        <span className="text-center">
          Already registered?
          <br />
          <LinkWithCallback targetPath="/login">Login here</LinkWithCallback>
        </span>
      </Suspense>
    </main>
  );
}
