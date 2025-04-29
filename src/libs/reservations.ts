"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createReservationAPI,
  deleteReservationAPI,
  getCoworkingSpaceReservationsAPI,
  getReservationAPI,
  getUserReservationsAPI,
  updateReservationAPI,
} from "./api/reservations";
import { Session } from "next-auth";
import { CoworkingSpaceType, ReservationType, UserType } from "./types";

export async function getUserReservations(
  session: Session,
  query?: { page?: number; limit?: number; min?: number; max?: number; status?: string; search?: string }
): Promise<
  | {
      success: true;
      total: number;
      count: number;
      data: (Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType })[];
    }
  | { success: false }
> {
  try {
    return await getUserReservationsAPI(session, query);
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function getCoworkingReservations(
  id: string,
  session: Session,
  query?: { page?: number; limit?: number; min?: number; max?: number; status?: string; search?: string }
): Promise<
  | {
      success: true;
      total: number;
      count: number;
      data: (Omit<ReservationType, "user"> & { user: UserType })[];
    }
  | { success: false }
> {
  try {
    const response = await getCoworkingSpaceReservationsAPI(id, session, query);
    if (response.success)
      return { success: true, data: response.data, count: response.count, total: response.total };
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

export async function getReservation(
  id: string,
  session: Session
): Promise<
  | { success: true; data: Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType } }
  | { success: false }
> {
  try {
    return getReservationAPI(id, session);
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

const CreateReservationForm = z.object({
  coworkingSpace: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  personCount: z.number().min(1, { message: "Person Count must be at least 1" }),
});
export async function createReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await CreateReservationForm.safeParseAsync({
    ...data,
    personCount: Number(data["personCount"]),
  });
  if (!validatedFields.success) return { success: false, error: validatedFields.error.flatten(), data };
  try {
    const response = await createReservationAPI(validatedFields.data, session);
    if (response.success) return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function updateReservationStatus(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  const approvalStatus = await z
    .enum(["pending", "canceled", "approved", "rejected"])
    .safeParseAsync(formData.get("approvalStatus")?.toString());
  if (!id || !approvalStatus.success) return { success: false, message: "Invalid Input (111)" };
  try {
    const result = await updateReservationAPI(id, { approvalStatus: approvalStatus.data }, session);
    return result.success ? { success: true, data: result.data } : { success: false };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

export async function deleteReservation(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Invalid Input (111)" };
  try {
    return await deleteReservationAPI(id, session);
  } catch (error) {
    console.log(error);
  }
}
