"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { FilterQuery } from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "./db/dbConnect";
import Reservation, { type Reservation as ReservationType } from "./db/models/Reservation";
import { CWS } from "./db/models/CoworkingSpace";
import { UserType } from "./db/models/User";
import mongoose from "mongoose";

export async function getReservations(
  filter: FilterQuery<ReservationType> = {},
  page: number = 0,
  limit: number = 5,
  search: string = ""
) {
  const session = await auth();
  if (session) {
    console.log("MISS");
    return await unstable_cache(
      async () => {
        await dbConnect();
        try {
          try {
            new RegExp(search);
          }catch(error){
            if(error instanceof SyntaxError){
              search = "^$."
            }
          }
          const result = (
            await Reservation.aggregate<{
              data: (Omit<Omit<ReservationType, "coworkingSpace">, "user"> & {
                user: UserType;
                coworkingSpace: CWS;
              })[];
              total: number;
            }>([
              { $match: filter },
              {
                $lookup: {
                  from: "coworkingspaces",
                  localField: "coworkingSpace",
                  foreignField: "_id",
                  as: "coworkingSpace",
                  pipeline: [{ $match: { name: { $regex: search } } }],
                },
              },
              {
                $match: {
                  coworkingSpace: { $not: { $size: 0 } },
                  ...(session.user.role == "admin" ?
                    {}
                  : {
                      $or: [
                        {
                          "coworkingSpace.owner": mongoose.Types.ObjectId.createFromHexString(
                            session.user.id
                          ),
                        },
                        { user: mongoose.Types.ObjectId.createFromHexString(session.user.id) },
                      ],
                    }),
                },
              },
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
          const data = result?.data || [];
          const total = result?.total || 0;
          return { success: true, total, count: data.length, data };
        } catch (error) {
          console.error(error);
        }
        return { success: false };
      },
      [page.toString(), limit.toString(), search, JSON.stringify(filter), JSON.stringify(session.user)],
      { tags: ["reservations"], revalidate: 60 }
    )();
  }
  return { success: false };
}

export async function getReservation(id: string) {
  const session = await auth();
  if (session)
    return await unstable_cache(
      async () => {
        await dbConnect();
        try {
          const reservation = (
            await Reservation.findById(id).populate<{ coworkingSpace: CWS }>("coworkingSpace")
          )?.toObject();
          if (reservation) {
            if (
              reservation.user == session.user.id
              || session.user.role == "admin"
              || session.user.id == reservation.coworkingSpace.owner
            ) {
              return { success: true, data: reservation };
            }
          } else {
            return { success: false, message: "Reservation not found" };
          }
        } catch (error) {
          console.log(error);
        }
        return { success: false };
      },
      [id],
      { tags: ["reservations"], revalidate: 300 }
    )();
  return { success: false };
}

const ReservationForm = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  personCount: z.number().min(1, { message: "Person Count must be at least 1" }).optional(),
  approvalStatus: z.enum(["pending", "canceled", "approved", "rejected"]).optional(),
});
export async function createReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  const coworkingSpaceId = formData.get("coworkingSpaceId")?.toString();
  if (!session || !coworkingSpaceId) return { success: false };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await ReservationForm.safeParseAsync({
    ...data,
    personCount: Number(data["personCount"]),
  });
  if (validatedFields.success) {
    try {
      await dbConnect();
      const existedReservations = await Reservation.countDocuments({ user: session.user.id });
      if (existedReservations >= 3 && session.user.role !== "admin") {
        return { success: false, message: "Reservation limit of 3 reached" };
      }
      const reservation = await Reservation.create({
        ...validatedFields.data,
        user: session.user.id,
        coworkingSpace: coworkingSpaceId,
      });
      if (reservation) {
        revalidateTag("reservations");
        return { success: true, data: reservation.toObject() };
      }
    } catch (error) {
      // TODO: Show error message from database to user
      console.error(error);
    }
    return { success: false };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

export async function editReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  const id = formData.get("id")?.toString();
  if (!session || !id) return { success: false };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await ReservationForm.safeParseAsync({
    ...data,
    personCount: Number(data["personCount"]) || undefined,
  });
  if (validatedFields.success) {
    await dbConnect();
    try {
      const reservation = (
        await Reservation.findById(id).populate<{ coworkingSpace: CWS }>("coworkingSpace")
      )?.toObject();
      if (!reservation) return { success: false, message: "Reservation not found" };
      if (
        reservation.user !== session.user.id
        && session.user.role !== "admin"
        && session.user.id != reservation.coworkingSpace.owner
      ) {
        return { success: false, message: "You are not authorized to update this reservation" };
      }
      const updatedReservation = await Reservation.findByIdAndUpdate(id, validatedFields.data, {
        new: true,
        runValidators: true,
      });
      if (updatedReservation) {
        revalidateTag("reservations");
        return { success: true, data: updatedReservation.toObject() };
      }
    } catch (err) {
      console.log(err);
    }
    return { success: false };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

export async function deleteReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  const id = formData.get("id")?.toString();
  if (!session || !id) return { success: false };
  await dbConnect();
  try {
    const reservation = (
      await Reservation.findById(id).populate<{ coworkingSpace: CWS }>("coworkingSpace")
    )?.toObject();
    if (!reservation) return { success: false, message: "Reservation not found" };
    if (
      reservation.user !== session.user.id
      && session.user.role !== "admin"
      && session.user.id != reservation.coworkingSpace.owner
    ) {
      return { success: false, message: "You are not authorized to delete this reservation" };
    }
    const result = await Reservation.findByIdAndDelete(id);
    if (result) {
      revalidateTag("reservations");
      return { success: true };
    }
  } catch (error) {
    console.log(error);
  }
  return { success: false };
}
