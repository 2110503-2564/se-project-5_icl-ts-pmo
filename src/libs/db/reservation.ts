import { unstable_cache } from "next/cache";
import dbConnect from "./dbConnect";
import Reservation, { ReservationType } from "./models/Reservation";
import { UserType } from "./models/User";
import { CWS } from "./models/CoworkingSpace";
import mongoose from "mongoose";

export const getReservationsDB = unstable_cache(
  async (
    filter: mongoose.FilterQuery<ReservationType>,
    cwsFilter: mongoose.FilterQuery<CWS>,
    userID: string | undefined,
    page: number,
    limit: number
  ) => {
    await dbConnect();
    const result = (
      await Reservation.aggregate<
        | {
            data: (Omit<Omit<ReservationType, "coworkingSpace">, "user"> & {
              user: UserType;
              coworkingSpace: CWS;
            })[];
            total: number;
          }
        | undefined
      >([
        { $match: filter },
        {
          $lookup: {
            from: "coworkingspaces",
            localField: "coworkingSpace",
            foreignField: "_id",
            let: { user: "$user" },
            pipeline: [
              {
                $match: {
                  ...cwsFilter,
                  ...(userID ?
                    {
                      $or: [
                        { $expr: { $eq: ["$$user", mongoose.Types.ObjectId.createFromHexString(userID)] } },
                        { owner: mongoose.Types.ObjectId.createFromHexString(userID) },
                      ],
                    }
                  : {}),
                },
              },
            ],
            as: "coworkingSpace",
          },
        },
        { $match: { coworkingSpace: { $not: { $size: 0 } } } },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
        {
          $set: {
            user: { $arrayElemAt: ["$user", 0] },
            coworkingSpace: { $arrayElemAt: ["$coworkingSpace", 0] },
          },
        },
        {
          $set: {
            _id: { $toString: "$_id" },
            "user._id": { $toString: "$user._id" },
            "coworkingSpace._id": { $toString: "$coworkingSpace._id" },
            "coworkingSpace.owner": { $toString: "$coworkingSpace.owner" },
          },
        },
        { $group: { _id: null, data: { $push: "$$ROOT" }, total: { $count: {} } } },
        { $project: { _id: 0, data: { $slice: ["$data", page * limit, limit] }, total: 1 } },
      ])
    )[0];
    return { data: result?.data || [], total: result?.total || 0 };
  },
  undefined,
  { tags: ["reservations"], revalidate: 60 }
);

export const getReservationDB = unstable_cache(
  async (id: string) => {
    await dbConnect();
    return (await Reservation.findById(id).populate<{ coworkingSpace: CWS }>("coworkingSpace"))?.toObject();
  },
  undefined,
  { tags: ["reservations"], revalidate: 300 }
);
