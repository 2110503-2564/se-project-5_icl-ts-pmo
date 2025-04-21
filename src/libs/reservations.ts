"use server";

import { revalidateTag } from "next/cache";
import { Session } from "next-auth";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "./db/dbConnect";
import { getReservationDB, getReservationsDB } from "./db/reservation";
import { CWS } from "./db/models/CoworkingSpace";
import Reservation, { ReservationType } from "./db/models/Reservation";

export async function getReservations(
  filter: mongoose.FilterQuery<ReservationType> = {},
  page: number = 0,
  limit: number = 5,
  search: string = ""
) {
  const session = await auth();
  if (session) {
    try {
      new RegExp(search);
    } catch (error) {
      if (error instanceof SyntaxError) {
        search = "^$.";
      }
    }
    try {
      const { data, total } = await getReservationsDB(
        filter,
        { name: { $regex: search } },
        session.user.role == "admin" ? undefined : session.user.id,
        page,
        limit
      );
      return { success: true, total: total, count: data.length, data };
    } catch (error) {
      console.error(error);
    }
  }
  return { success: false };
}

export async function getReservation(id: string) {
  const session = await auth();
  if (session) {
    try {
      const reservation = await getReservationDB(id);
      if (!reservation) return { success: false, message: "Reservation not found" };
      if (!checkPermission(session.user, reservation)) return { success: false, message: "No Permission" };
      return { success: true, data: reservation };
    } catch (error) {
      console.error(error);
    }
  }
  return { success: false };
}

const CreateReservationForm = z.object({
  coworkingSpace: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  personCount: z.number().min(1, { message: "Person Count must be at least 1" }),
});
export async function createReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await CreateReservationForm.safeParseAsync({
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
      const reservation = await Reservation.create({ ...validatedFields.data, user: session.user.id });
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

export async function updateReservationStatus(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  const approvalStatus = formData.get("approvalStatus")?.toString();
  if (id && approvalStatus) {
    await dbConnect();
    try {
      const reservation = await getReservationDB(id);
      if (!reservation) return { success: false, message: "Reservation not found" };
      if (reservation.approvalStatus != "pending")
        return { success: false, message: "Cannot edit non-pending reservation" };
      if (!checkPermission(session.user, reservation))
        return { success: false, message: "You are not authorized to update this reservation" };
      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        { approvalStatus },
        { new: true, runValidators: true }
      );
      if (updatedReservation) {
        revalidateTag("reservations");
        return { success: true, data: updatedReservation.toObject() };
      }
    } catch (err) {
      console.error(err);
    }
  }
  return { success: false, message: "error occured on the database/server" };
}

export async function deleteReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  if (id) {
    await dbConnect();
    try {
      const reservation = await getReservationDB(id);
      if (!reservation) return { success: false, message: "Reservation not found" };
      if (!checkPermission(session.user, reservation))
        return { success: false, message: "You are not authorized to delete this reservation" };

      const result = await Reservation.findByIdAndDelete(id);
      if (result) {
        revalidateTag("reservations");
        return { success: true };
      }
    } catch (error) {
      console.log(error);
    }
  }
  return { success: false, message: "error occured" };
}

function checkPermission(
  user: Session["user"],
  reservation: Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CWS }
) {
  return (
    reservation.user === user.id || user.role === "admin" || user.id === reservation.coworkingSpace.owner
  );
}
