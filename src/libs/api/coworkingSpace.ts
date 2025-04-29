"use server";

import { Session } from "next-auth";
import { CoworkingSpaceType, ReservationType } from "../types";
import { revalidateTag } from "next/cache";
import { appeadSearch } from "./utils";

type CoworkingSpaceResponse = { success: true; data: CoworkingSpaceType } | { success: false };

/**
 * @cacheTag `coworkingSpaces`
 */
export async function getCoWorkingSpacesAPI(
  page?: number,
  limit?: number,
  search?: string
): Promise<{ success: true; total: number; count: number; data: CoworkingSpaceType[] } | { success: false }> {
  return (await fetch(`${process.env.API_URL}/coworkingSpaces${appeadSearch({ page, limit, search })}`, {
    method: "GET",
    next: { tags: ["coworkingSpaces"], revalidate: 300 },
  }).then((e) => e.json())) as
    | { success: true; total: number; count: number; data: CoworkingSpaceType[] }
    | { success: false };
}

/**
 * @cacheTag `coworkingSpaces-${id}`
 */
export async function getCoWorkingSpaceAPI(id: string): Promise<CoworkingSpaceResponse> {
  return (await fetch(`${process.env.API_URL}/coworkingSpaces/${id}`, {
    method: "GET",
    next: { tags: [`coworkingSpaces-${id}`], revalidate: 600 },
  }).then((e) => e.json())) as CoworkingSpaceResponse;
}

/**
 * @revalidateTag `coworkingSpaces`
 */
export async function createCoworkingSpaceAPI(
  payload: Partial<CoworkingSpaceType>,
  session: Session
): Promise<CoworkingSpaceResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/coworkingSpaces`, {
      method: "POST",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as CoworkingSpaceResponse;
    if (response.success) {
      revalidateTag("coworkingSpaces");
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `coworkingSpaces` `coworkingSpaces-{id}`
 */
export async function updateCoWorkingSpaceAPI(
  id: string,
  payload: Partial<CoworkingSpaceType>,
  session: Session
): Promise<CoworkingSpaceResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/coworkingSpaces/${id}`, {
      method: "PUT",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as CoworkingSpaceResponse;
    if (response.success) {
      revalidateTag("coworkingSpaces");
      revalidateTag(`coworkingSpaces-${id}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `coworkingSpaces` `coworkingSpaces-{id}`
 */
export async function deleteCoWorkingSpaceAPI(id: string, session: Session): Promise<{ success: boolean }> {
  try {
    const response = (await fetch(`${process.env.API_URL}/coworkingSpaces/${id}`, {
      headers: { authorization: `Bearer ${session.user.token}` },
      method: "DELETE",
      cache: "no-cache",
    }).then((e) => e.json())) as { success: boolean };
    if (response.success) {
      revalidateTag("coworkingSpaces");
      revalidateTag(`coworkingSpaces-${id}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @cacheTag `reservations-coworkingSpaces-${id}`
 */
export async function getCoworkingSpaceTotalReservationAPI(id: string, session: Session) {
  return (await fetch(`${process.env.API_URL}/coworkingSpaces/${id}/totalReservation`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: [`reservations-coworkingSpaces-${id}`], revalidate: 150 },
  }).then((e) => e.json())) as
    | { success: true; data: { [P in ReservationType["approvalStatus"]]: number } & { total: number } }
    | { success: false };
}

/**
 * @cacheTag `reservations-coworkingSpaces-${id}`
 */
export async function getCoworkingSpaceFrequencyAPI(id: string, session: Session) {
  return (await fetch(`${process.env.API_URL}/coworkingSpaces/${id}/frequency`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: [`reservations-coworkingSpaces-${id}`], revalidate: 180 },
  }).then((e) => e.json())) as
    | { success: true; data: { data: { label: string; data: number[] }[]; label: string[] } }
    | { success: false };
}
