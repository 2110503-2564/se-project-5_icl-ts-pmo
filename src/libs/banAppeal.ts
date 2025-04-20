"use server";

import { auth } from "@/auth";
import dbConnect from "@/libs/db/dbConnect";
import BanAppeal, { BanAppealType } from "@/libs/db/models/BanAppeal";
import { z } from "zod";
import BanIssue from "./db/models/BanIssue";
import { revalidateTag } from "next/cache";
import { getBanAppealDB, getBanAppealsDB } from "./db/banAppeal";
import { FilterQuery } from "mongoose";

export async function getBanAppeals(
  filter: FilterQuery<BanAppealType> = {},
  page: number = 0,
  limit: number = 5,
  search: string = ""
) {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "unauthorized" };
  try {
    const result = await getBanAppealsDB(filter, page, limit, search);
    const data = result?.data || [];
    const total = result?.total || 0;
    return { success: true, total, count: data.length, data };
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

export async function getBanAppeal(id: string) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  try {
    const banAppeal = await getBanAppealDB(id);
    if (!banAppeal) return { success: false, message: "Ban Issue not found" };
    if (banAppeal.banIssue.user != session.user.id && session.user.role != "admin")
      return { success: false, message: "No permission to view this" };
    return { success: true, data: banAppeal };
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
  if (validatedFields.success) {
    await dbConnect();
    try {
      const banIssue = (await BanIssue.findById(validatedFields.data.banIssue))?.toObject();
      if (!banIssue) return { success: false, message: "ban issue not found" };
      if (session.user.id != banIssue.user)
        return { success: false, message: "You are not this ban issue target" };
      const banAppeal = (await BanAppeal.insertOne(validatedFields.data))?.toObject();
      if (banAppeal) {
        revalidateTag("banAppeals");
        revalidateTag(`banIssues-${validatedFields.data.banIssue}`);
        return { success: true, data: banAppeal };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

const CommentSchema = z.object({
  banAppeal: z.string(),
  text: z.string().max(500, { message: "Comment can not be more than 500 characters" }),
});
export async function createBanAppealComment(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await CommentSchema.safeParseAsync(data);
  if (validatedFields.success) {
    await dbConnect();
    try {
      const banAppeal = (
        await BanAppeal.findByIdAndUpdate(
          validatedFields.data.banAppeal,
          { $push: { comment: { user: session.user.id, text: validatedFields.data.text } } },
          { new: true, runValidators: true }
        )
      )?.toObject();
      if (banAppeal) {
        revalidateTag(`banAppeals-${banAppeal._id}`);
        return { success: true };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

export async function resolveBanAppeal(id: string, resolveStatus: "denied" | "resolved") {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "unauthorized" };
  await dbConnect();
  try {
    const banAppeal = (await BanAppeal.findById(id))?.toObject();
    if (banAppeal && banAppeal.resolveStatus == "pending") {
      const resolvedAt = new Date();
      const [updatedBanIssue, updatedBanAppeal] = await Promise.all([
        BanIssue.findByIdAndUpdate(
          banAppeal.banIssue,
          { isResolved: resolveStatus == "resolved", resolvedAt },
          { new: true, runValidators: true }
        ),
        resolveStatus == "resolved" ?
          BanAppeal.findByIdAndUpdate(id, { resolveStatus, resolvedAt }, { new: true, runValidators: true })
        : null,
      ]);
      revalidateTag("banAppeals");
      revalidateTag(`banAppeals-${id}`);
      if (resolveStatus == "resolved") {
        revalidateTag(`banIssues`);
        revalidateTag(`banIssues-${banAppeal.banIssue}`);
        if (!updatedBanAppeal != !updatedBanIssue) {
          console.error(
            "FATAL: resolveBanAppeal() -> Ban issue and Ban appeal is not in sync with each other"
          );
        }
      }
      return { success: true };
    }
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}
