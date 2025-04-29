"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { Session } from "next-auth";
import {
  createBanAppealAPI,
  createBanAppealCommentAPI,
  getBanAppealAPI,
  getBanAppealsAPI,
  updateBanAppealAPI,
} from "./api/banIssue";
import { BanAppealType, BanIssueType, CommentType, UserType } from "./types";

export async function getBanAppeals(
  session: Session,
  query?: { page?: number; limit?: number; search?: string }
) {
  if (!session || session.user.role != "admin") return { success: false, message: "unauthorized" };
  try {
    const response = await getBanAppealsAPI(session, query);
    if (response.success)
      return { success: true, data: response.data, count: response.count, total: response.total };
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

export async function getBanAppeal(
  id: string,
  appeal: string,
  session: Session
): Promise<
  | {
      success: true;
      data: Omit<Omit<BanAppealType, "banIssue">, "comment"> & {
        banIssue: BanIssueType;
        comment: (Omit<CommentType, "user"> & { user: UserType })[];
      };
    }
  | { success: false }
> {
  try {
    const response = await getBanAppealAPI(id, appeal, session);
    if (response.success) return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
  }
  return { success: false };
}

const BanAppealSchema = z.object({
  banIssue: z.string(),
  description: z.string().max(500, { message: "Description can not be more than 500 characters" }),
});
export async function createBanAppeal(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await BanAppealSchema.safeParseAsync(data);
  if (!validatedFields.success) return { success: false, error: validatedFields.error.flatten(), data };
  try {
    const response = await createBanAppealAPI(validatedFields.data.banIssue, validatedFields.data, session);
    if (response.success) return { success: true, data: response.data };
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

const CommentSchema = z.object({
  banAppeal: z.string(),
  text: z.string().max(500, { message: "Comment can not be more than 500 characters" }),
});
export async function createBanAppealComment(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const data = Object.fromEntries(formData.entries());
  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Invalid input (111)" };
  const validatedFields = await CommentSchema.safeParseAsync(data);
  if (!validatedFields.success) return { success: false, error: validatedFields.error.flatten(), data };
  try {
    const response = await createBanAppealCommentAPI(
      id,
      validatedFields.data.banAppeal,
      validatedFields.data,
      session
    );
    if (response.success) return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, data };
  }
}

export async function updateBanAppeal(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  const appeal = formData.get("appeal")?.toString();
  if (!id || !appeal) return { success: false, message: "invalid input (111)" };
  const validatedFields = await z
    .enum(["pending", "denied", "resolved"])
    .safeParseAsync(formData.get("status")?.toString());
  if (!validatedFields.success) return { success: false };
  const resolveStatus = validatedFields.data;

  try {
    const response = await updateBanAppealAPI(id, appeal, { resolveStatus }, session);
    if (response.success) return { success: true, data: response.data };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}
