import { unstable_cache } from "next/cache";
import dbConnect from "./dbConnect";
import { BanAppealType } from "./models/BanAppeal";
import mongoose, { FilterQuery } from "mongoose";
import BanIssue, { BanIssueType } from "./models/BanIssue";
import { UserType } from "./models/User";

export const getBanIssuesDB = unstable_cache(
  async (filter: FilterQuery<BanIssueType>, page: number = 0, limit: number = 5, search: string = "") => {
    // console.log("MISS");
    await dbConnect();
    return (
      await BanIssue.aggregate<
        { data: (BanIssueType & { user: UserType; admin: UserType })[]; total: number } | undefined
      >([
        { $match: filter },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [{ $match: { $or: [{ name: { $regex: search } }, { email: { $regex: search } }] } }],
          },
        },
        { $lookup: { from: "users", localField: "admin", foreignField: "_id", as: "admin" } },
        { $match: { user: { $not: { $size: 0 } } } },
        { $set: { user: { $arrayElemAt: ["$user", 0] }, admin: { $arrayElemAt: ["$admin", 0] } } },
        {
          $set: {
            _id: { $toString: "$_id" },
            "user._id": { $toString: "$user._id" },
            "admin._id": { $toString: "$admin._id" },
          },
        },
        { $group: { _id: null, data: { $push: "$$ROOT" }, total: { $count: {} } } },
        { $project: { _id: 0, data: { $slice: ["$data", page * limit, limit] }, total: 1 } },
      ])
    )[0];
  },
  undefined,
  { tags: ["banIssues"], revalidate: 300 }
);

export async function getBanIssueDB(id: string) {
  return unstable_cache(
    async (id: string) => {
      // console.log("MISS");
      await dbConnect();
      return (
        await BanIssue.aggregate<
          | {
              banIssue: Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType };
              banAppeals: Omit<BanAppealType, "comment">[];
            }
          | undefined
        >([
          { $match: { _id: mongoose.Types.ObjectId.createFromHexString(id) } },
          { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
          { $lookup: { from: "users", localField: "admin", foreignField: "_id", as: "admin" } },
          { $lookup: { from: "banappeals", localField: "_id", foreignField: "banIssue", as: "banAppeals" } },
          { $set: { user: { $arrayElemAt: ["$user", 0] }, admin: { $arrayElemAt: ["$admin", 0] } } },
          {
            $set: {
              _id: { $toString: "$_id" },
              "user._id": { $toString: "$user._id" },
              "admin._id": { $toString: "$admin._id" },
            },
          },
          { $unwind: { path: "$banAppeals", preserveNullAndEmptyArrays: true } },
          {
            $set: {
              "banAppeals._id": { $toString: "$banAppeals._id" },
              "banAppeals.banIssue": { $toString: "$banAppeals.banIssue" },
            },
          },
          { $project: { "banAppeals.comment": 0 } },
          {
            $group: {
              _id: { $unsetField: { field: "banAppeals", input: "$$ROOT" } },
              banAppeals: { $push: "$banAppeals" },
            },
          },
          { $project: { _id: 0, banIssue: "$_id", banAppeals: "$banAppeals" } },
          {
            $set: {
              banAppeals: {
                $cond: [
                  {
                    $eq: [{ $getField: { field: "_id", input: { $arrayElemAt: ["$banAppeals", 0] } } }, null],
                  },
                  [],
                  "$banAppeals",
                ],
              },
            },
          },
        ])
      )[0];
    },
    undefined,
    { tags: [`banIssues-${id}`], revalidate: 600 }
  )(id);
}
