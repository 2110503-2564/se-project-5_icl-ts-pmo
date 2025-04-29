"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { Session } from "next-auth";
import {
  createBanIssueAPI,
  getActiveBanIssuesAPI,
  getBanIssueAPI,
  getUserBanIssuesAPI,
  resolveBanIssueAPI,
} from "./api/banIssue";
import { BanAppealType, BanIssueType, UserType } from "./types";

export async function getActiveBanIssues(
  session: Session,
  query?: { page?: number; limit?: number; search?: string }
): Promise<
  | {
      success: boolean;
      data: (Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType })[];
      total: number;
      count: number;
    }
  | { success: false }
> {
  try {
    const response = await getActiveBanIssuesAPI(session, query);
    if (response.success)
      return { success: true, data: response.data, total: response.total, count: response.count };
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

export async function getUserBanIssues(
  id: string,
  session: Session,
  query?: { page?: number; limit?: number; search?: string }
): Promise<
  | { success: false }
  | {
      success: true;
      data: (Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType })[];
      count: number;
      total: number;
    }
> {
  if (session.user.role !== "admin" && session.user._id != id) return { success: false };
  try {
    const response = await getUserBanIssuesAPI(id, session, query);
    if (response.success)
      return { success: true, data: response.data, count: response.count, total: response.total };
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

export async function getBanIssue(
  id: string,
  session: Session
): Promise<
  | {
      success: true;
      data: {
        banIssue: Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType };
        banAppeals: Omit<BanAppealType, "comment">[];
      };
    }
  | { success: false }
> {
  try {
    const response = await getBanIssueAPI(id, session);
    if (response.success) return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
  }
  return { success: false };
}

const BanIssueSchema = z.object({
  title: z.string().max(50, { message: "Title can not be more than 50 characters" }),
  description: z.string().max(500, { message: "Description can not be more than 500 characters" }),
  endDate: z.string().datetime(),
});
export async function createBanIssue(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "Not authorized" };
  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Invalid Input (111)" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await BanIssueSchema.safeParseAsync(data);
  if (!validatedFields.success) return { success: false, error: validatedFields.error.flatten(), data };
  if (new Date(validatedFields.data.endDate) <= new Date(Date.now())) {
    return { success: false, message: "You cannot pick time in the past" };
  }
  try {
    const response = await createBanIssueAPI(id, validatedFields.data, session);
    if (response.success) return { success: true, data: response.data };
  } catch (err) {
    console.error(err);
  }
  return { success: false, message: "error occur" };
}

export async function resolveBanIssue(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Invalid input (111)" };
  try {
    const response = await resolveBanIssueAPI(id, session);
    if (response.success) return response;
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}
