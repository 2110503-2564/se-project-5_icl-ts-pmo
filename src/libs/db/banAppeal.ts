import { unstable_cache } from "next/cache";
import mongoose from "mongoose";
import dbConnect from "./dbConnect";
import { UserType } from "./models/User";
import { BanIssueType } from "./models/BanIssue";
import BanAppeal, { BanAppealType, Comment } from "./models/BanAppeal";

export const getBanAppealsDB = unstable_cache(
  // TODO: Add search & filtering
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (filter: mongoose.FilterQuery<BanAppealType> = {}, page: number, limit: number, search: string) => {
    await dbConnect();
    return (
      await BanAppeal.aggregate<
        | {
            data: (Omit<Omit<BanAppealType, "comment">, "banIssue"> & {
              banIssue: Omit<BanIssueType, "user"> & { user: UserType };
            })[];
            total: number;
          }
        | undefined
      >([
        { $match: filter },
        { $project: { comment: 0 } },
        { $lookup: { from: "banissues", localField: "banIssue", foreignField: "_id", as: "banIssue" } },
        { $set: { banIssue: { $arrayElemAt: ["$banIssue", 0] } } },
        { $lookup: { from: "users", localField: "banIssue.user", foreignField: "_id", as: "banIssue.user" } },
        { $set: { "banIssue.user": { $arrayElemAt: ["$banIssue.user", 0] } } },
        {
          $set: {
            _id: { $toString: "$_id" },
            "banIssue._id": { $toString: "$banIssue._id" },
            "banIssue.user._id": { $toString: "$banIssue.user._id" },
            "banIssue.admin": { $toString: "$banIssue.admin" },
          },
        },
        { $group: { _id: null, data: { $push: "$$ROOT" }, total: { $count: {} } } },
        { $project: { _id: 0, data: { $slice: ["$data", page * limit, limit] }, total: 1 } },
      ])
    )[0];
  },
  undefined,
  { tags: ["banAppeals"], revalidate: 300 }
);

export async function getBanAppealDB(id: string) {
  return unstable_cache(
    async (id: string) => {
      await dbConnect();
      return (
        await BanAppeal.aggregate<
          | (Omit<Omit<BanAppealType, "banIssue">, "comment"> & {
              banIssue: BanIssueType;
              comment: (Omit<Comment, "user"> & { user: UserType })[];
            })
          | undefined
        >([
          { $match: { _id: mongoose.Types.ObjectId.createFromHexString(id) } },
          { $lookup: { from: "banissues", localField: "banIssue", foreignField: "_id", as: "banIssue" } },
          { $set: { banIssue: { $arrayElemAt: ["$banIssue", 0] } } },
          {
            $set: {
              _id: { $toString: "$_id" },
              "banIssue._id": { $toString: "$banIssue._id" },
              "banIssue.user": { $toString: "$banIssue.user" },
              "banIssue.admin": { $toString: "$banIssue.admin" },
            },
          },
          { $unwind: { path: "$comment", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "users", localField: "comment.user", foreignField: "_id", as: "comment.user" } },
          { $set: { "comment.user": { $arrayElemAt: ["$comment.user", 0] } } },
          {
            $set: {
              "comment._id": { $toString: "$comment._id" },
              "comment.user._id": { $toString: "$comment.user._id" },
            },
          },
          {
            $group: {
              _id: { $unsetField: { field: "comment", input: "$$ROOT" } },
              comment: { $push: "$comment" },
            },
          },
          { $replaceRoot: { newRoot: { $mergeObjects: ["$_id", { comment: "$comment" }] } } },
          {
            $set: {
              comment: {
                $cond: [
                  { $eq: [{ $getField: { field: "_id", input: { $arrayElemAt: ["$comment", 0] } } }, null] },
                  [],
                  "$comment",
                ],
              },
            },
          },
          { $project: { _id: 0 } },
        ])
      )[0];
    },
    undefined,
    { tags: [`banAppeals-${id}`], revalidate: 450 }
  )(id);
}
