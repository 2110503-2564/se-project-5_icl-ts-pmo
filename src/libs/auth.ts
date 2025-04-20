"use server";

import { AuthError } from "next-auth";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import dbConnect from "@/libs/db/dbConnect";
import User, { type UserType as UserType } from "@/libs/db/models/User";
import { isProtectedPage } from "@/utils";
import { FilterQuery, QueryOptions } from "mongoose";

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
  await dbConnect();
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await RegisterFormSchema.safeParseAsync(data);
  if (validatedFields.success) {
    try {
      const user = await User.insertOne(validatedFields.data);
      if (user) await signIn("credentials", formData);
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, message: "Account created but error occured during login" };
      }
      if (error instanceof Error && error.message == "NEXT_REDIRECT") {
        throw error;
      }
      console.error(error);
      // TODO: Show error message from database to user
      return { success: false, message: "error occured (email might be used)", data };
    }
  }
  return { success: false, error: validatedFields.error?.flatten(), data };
}

const LoginFormSchema = z.object({ email: emailField, password: passwordField });
export async function userLogin(formState: unknown, formData: FormData) {
  await dbConnect();
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

export async function getMe() {
  const session = await auth();
  if (session)
    return unstable_cache(
      async () => {
        await dbConnect();
        try {
          const user = await User.findById(session.user.id);
          if (user) return { success: true, data: user.toObject() };
        } catch (error) {
          console.error(error);
        }
        return { success: false };
      },
      [session.user.id],
      { revalidate: 780 }
    )();
  return { success: false };
}

export async function getUserList(filter: FilterQuery<UserType> = {}, options: QueryOptions<UserType> = {}) {
  await dbConnect();
  try {
    const users = await User.find(filter, undefined, options);
    if (users) {
      return { success: true, count: users.length, data: users.map((e) => e.toObject()) };
    }
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}
