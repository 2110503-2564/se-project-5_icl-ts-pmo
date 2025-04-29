"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { isProtectedPage } from "@/utils";
import { GetUserAPI, registerAPI } from "./api/auth";
import { UserType } from "./types";

const emailField = z
  .string({ required_error: "Email is required" })
  .email({ message: "Please add a valid email" });
const passwordField = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password must be at least 6 characters" });
const RegisterFormSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  phone: z.string({ required_error: "Phone is required" }),
  email: emailField,
  password: passwordField,
  role: z.enum(["user", "admin"]).default("user"),
});
export async function userRegister(formState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await RegisterFormSchema.safeParseAsync(data);
  if (validatedFields.success) {
    try {
      const registerResult = await registerAPI(validatedFields.data);
      if (registerResult.success) await signIn("credentials", formData);
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, message: "Account created but error occured during login" };
      }
      if (error instanceof Error && error.message == "NEXT_REDIRECT") {
        throw error;
      }
      console.error(error);
      return { success: false, message: "error occured (email might be used)", data };
    }
  }
  return { success: false, error: validatedFields.error?.flatten(), data };
}

const LoginFormSchema = z.object({ email: emailField, password: passwordField });
export async function userLogin(formState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await LoginFormSchema.safeParseAsync(data);
  try {
    if (validatedFields.success) {
      await signIn("credentials", formData);
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: "Invalid credentials", data };
    }
    if (error instanceof Error && error.message == "NEXT_REDIRECT") {
      throw error;
    }
    console.error(error);
    return { success: false };
  }
  return { success: false, error: validatedFields.error?.flatten(), data };
}

export async function userLogout(pathname: string) {
  await signOut(isProtectedPage(pathname) ? { redirectTo: `/login?callbackUrl=${pathname}` } : undefined);
}

export async function getUser(id: string): Promise<{ success: true; data: UserType } | { success: false }> {
  try {
    return await GetUserAPI(id);
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

// export async function getUserList(filter: FilterQuery<UserType> = {}, options: QueryOptions<UserType> = {}) {
//   await dbConnect();
//   try {
//     const users = await User.find(filter, undefined, options);
//     if (users) {
//       return { success: true, count: users.length, data: users.map((e) => e.toObject()) };
//     }
//   } catch (err) {
//     console.error(err);
//   }
//   return { success: false };
// }
