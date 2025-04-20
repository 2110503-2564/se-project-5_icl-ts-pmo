"use server";

import dbConnect from "../db/dbConnect";
import BanIssue from "../db/models/BanIssue";
import { resolveExpiredBan } from "../banIssue";

export async function checkBanAPI(id: string) {
  await dbConnect();
  try {
    await resolveExpiredBan();
    const banIssue = await BanIssue.countDocuments({
      user: id,
      endDate: { $gt: new Date() },
      isResolved: false,
    });
    return { success: true, isBanned: !!banIssue };
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

export async function checkBanIssue(id: string) {
  try {
    await resolveExpiredBan();
    await dbConnect();
    const issue = await BanIssue.findById(id);
    if(!issue){
      return {success: false, message: "Ban issue not found"};
    }
    return {success: true, isBanned: !issue.isResolved};
  } catch (error) {
    return {success: false, message: error};
  }
}
