"use client";

import { Suspense, useActionState, useEffect } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { userLogin } from "@/libs/auth";
import PasswordField from "../PasswordField";
import RedirectToInput from "../RedirectToInput";
import LinkWithCallback from "../LinkWithCallback";
import { useSnackpackContext } from "@/provider/SnackbarProvider";

export default function LoginForm({ redirected }: { redirected?: string }) {
  const [state, action, pending] = useActionState(userLogin, undefined);
  const [, setSnackPack] = useSnackpackContext();

  useEffect(() => {
    if (redirected === "true") {
      setSnackPack((prev) => [
        ...prev,
        {
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
          autoHideDuration: 2500,
          key: new Date().getTime(),
          children: (
            <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
              You need to login
            </Alert>
          ),
        },
      ]);
    }
  }, [redirected, setSnackPack]);

  return (
    <main className="flex flex-col items-center gap-4 p-4">
      <Suspense>
        <div className="h-fit w-fit rounded border p-8">
          <h1>Login</h1>
          <form className="flex flex-col items-center gap-4 py-4" action={action}>
            <RedirectToInput />
            <TextField
              className="w-full"
              id="email"
              name="email"
              label="Email"
              variant="filled"
              error={!!state?.error?.fieldErrors.email}
              helperText={state?.error?.fieldErrors.email?.join()}
              defaultValue={state?.data?.email.toString() || null}
              autoFocus
              required
            />
            <PasswordField
              props={{
                name: "password",
                error: !!state?.error?.fieldErrors.password,
                defaultValue: state?.data?.password.toString() || null,
              }}
              helperText={state?.error?.fieldErrors.password?.join()}
            />
            <Button className="w-full" type="submit" variant="contained" disabled={pending}>
              Login
            </Button>
            {state?.message && <span>{state.message}</span>}
          </form>
        </div>
        <span className="text-center">
          Doesn&lsquo;t have an account?
          <br />
          <LinkWithCallback targetPath="/register">Register here</LinkWithCallback>
        </span>
      </Suspense>
    </main>
  );
}
