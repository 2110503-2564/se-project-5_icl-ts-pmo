"use server";

import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "./db/dbConnect";
import User from "./db/models/User";
import BanIssue, { type BanIssueType as BanIssueType } from "./db/models/BanIssue";
import { revalidateTag } from "next/cache";
import { FilterQuery } from "mongoose";
import mongoose from "mongoose";
import { getBanIssuesDB, getBanIssueDB } from "./db/banIssue";

export async function getBanIssues(
  filter: FilterQuery<BanIssueType> = {},
  page: number = 0,
  limit: number = 5,
  search: string = ""
) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  if (session.user.role != "admin")
    filter.user = mongoose.Types.ObjectId.createFromHexString(session.user.id);
  try {
    new RegExp(search);
  } catch (error) {
    if (error instanceof SyntaxError) {
      search = "^$.";
    }
  }
  try {
    const result = await getBanIssuesDB(filter, page, limit, search);
    const data = result?.data || [];
    const total = result?.total || 0;
    return { success: true, total, count: data.length, data };
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

export async function getBanIssue(id: string) {
  const session = await auth();
  if (session) {
    try {
      const result = await getBanIssueDB(id);
      if (!result) return { success: false, message: "Ban Issue not found" };
      if (result.banIssue.user._id != session.user.id && session.user.role != "admin")
        return { success: false, message: "No permission to view this ban issue" };
      return { success: true, data: result };
    } catch (error) {
      console.log(error);
    }
  }
  return { success: false };
}

const BanIssueSchema = z.object({
  user: z.string(),
  title: z.string().max(50, { message: "Title can not be more than 50 characters" }),
  description: z.string().max(500, { message: "Description can not be more than 500 characters" }),
  endDate: z.string().datetime(),
});
export async function createBanIssue(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "Not authorized" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await BanIssueSchema.safeParseAsync(data);
  if (validatedFields.success) {
    if (new Date(validatedFields.data.endDate) <= new Date(Date.now())) {
      return { success: false, message: "You cannot pick time in the past" };
    }
    await dbConnect();
    try {
      const user = await User.findOne({ email: validatedFields.data.user });
      if (!user) return { success: false, message: "user not found", data };
      const isBanned = await BanIssue.countDocuments({
        user: user._id,
        endDate: { $gt: new Date() },
        isResolved: false,
      });
      if (isBanned > 0) return { success: false, message: "user is already banned", data };

      const banIssue = await BanIssue.insertOne({
        ...validatedFields.data,
        user: user._id,
        admin: session.user.id,
      });
      if (banIssue) {
        revalidateTag("banIssues");
        return { success: true, data: banIssue.toObject() };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

export async function resolveBanIssue(id: string) {
  const session = await auth();
  if (!session || session.user.role != "admin") return { success: false, message: "unauthorized" };
  await dbConnect();
  try {
    const banIssue = await BanIssue.findByIdAndUpdate(
      id,
      { isResolved: true },
      { new: true, runValidators: true }
    );
    if (banIssue) {
      revalidateTag("banIssues");
      revalidateTag(`banIssues-${id}`);
      return { success: true, data: banIssue.toObject() };
    }
  } catch (err) {
    console.error(err);
  }
  return { success: false };
}

export async function resolveExpiredBan() {
  try {
    await dbConnect();
    const result = await BanIssue.updateMany({ isResolved: false, endDate: { $lte: Date.now() } }, [
      { $set: { isResolved: true, resolvedAt: "$endDate" } },
    ]);
    if (result.matchedCount) {
      revalidateTag("banIssues");
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error };
  }
}
