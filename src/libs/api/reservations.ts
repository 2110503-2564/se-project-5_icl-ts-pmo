"use server";

import { Session } from "next-auth";
import { CoworkingSpaceType, ReservationType, UserType } from "../types";
import { revalidateTag } from "next/cache";
import { appeadSearch } from "./utils";

type ReservationResponse = { success: true; data: ReservationType } | { success: false };

/**
 * @cacheTag `reservations-users-${id}`
 */
export async function getUserReservationsAPI(
  session: Session,
  query: { page?: number; limit?: number; min?: number; max?: number; status?: string; search?: string } = {}
): Promise<
  | {
      success: true;
      total: number;
      count: number;
      data: (Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType })[];
    }
  | { success: false }
> {
  return (await fetch(`${process.env.API_URL}/reservations${appeadSearch(query)}`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: [`reservations-users-${session.user._id}`], revalidate: 180 },
  }).then((e) => e.json())) as
    | {
        success: true;
        total: number;
        count: number;
        data: (Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType })[];
      }
    | { success: false };
}

/**
 * @cacheTag `reservations-coworkingSpaces-${id}`
 */
export async function getCoworkingSpaceReservationsAPI(
  id: string,
  session: Session,
  query: { page?: number; limit?: number; min?: number; max?: number; status?: string; search?: string } = {}
): Promise<
  | {
      success: true;
      total: number;
      count: number;
      data: (Omit<ReservationType, "user"> & { user: UserType })[];
    }
  | { success: false }
> {
  return (await fetch(`${process.env.API_URL}/reservations/coworkingSpaces/${id}${appeadSearch(query)}`, {
    headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
    method: "GET",
    next: { tags: [`reservations-coworkingSpaces-${id}`], revalidate: 180 },
  }).then((e) => e.json())) as
    | {
        success: true;
        total: number;
        count: number;
        data: (Omit<ReservationType, "user"> & { user: UserType })[];
      }
    | { success: false };
}

/**
 * @cacheTag `reservations-${id}`
 */
export async function getReservationAPI(
  id: string,
  session: Session
): Promise<
  | { success: true; data: Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType } }
  | { success: false }
> {
  return (await fetch(`${process.env.API_URL}/reservations/${id}`, {
    headers: { authorization: `Bearer ${session.user.token}` },
    method: "GET",
    next: { tags: [`reservations-${id}`], revalidate: 300 },
  }).then((e) => e.json())) as
    | {
        success: true;
        data: Omit<ReservationType, "coworkingSpace"> & { coworkingSpace: CoworkingSpaceType };
      }
    | { success: false };
}

/**
 * @revalidateTag `reservations-users-${id}` `reservations-coworkingSpaces-${id}`
 */
export async function createReservationAPI(
  payload: Partial<ReservationType>,
  session: Session
): Promise<{ success: true; data: ReservationType } | { success: false }> {
  try {
    const response = (await fetch(`${process.env.API_URL}/reservations`, {
      method: "POST",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as ReservationResponse;
    if (response.success) {
      revalidateTag(`reservations-users-${response.data.user}`);
      revalidateTag(`reservations-coworkingSpaces-${response.data.coworkingSpace}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `reservations-users-${id}` `reservations-coworkingSpaces-${id}` `reservations-${id}`
 */
export async function updateReservationAPI(
  id: string,
  payload: Partial<ReservationType>,
  session: Session
): Promise<{ success: true; data: ReservationType } | { success: false }> {
  try {
    const response = (await fetch(`${process.env.API_URL}/reservations/${id}`, {
      method: "PUT",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as ReservationResponse;
    if (response.success) {
      revalidateTag(`reservations-users-${id}`);
      revalidateTag(`reservations-coworkingSpaces-${id}`);
      revalidateTag(`reservations-${id}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `reservations-users-${id}` `reservations-coworkingSpaces-${id}` `reservations-${id}`
 */
export async function deleteReservationAPI(
  id: string,
  session: Session
): Promise<{ success: true; data: ReservationType } | { success: false }> {
  try {
    const response = (await fetch(`${process.env.API_URL}/reservations/${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      cache: "no-cache",
    }).then((e) => e.json())) as ReservationResponse;
    if (response.success) {
      revalidateTag(`reservations-users-${id}`);
      revalidateTag(`reservations-coworkingSpaces-${id}`);
      revalidateTag(`reservations-${id}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}
