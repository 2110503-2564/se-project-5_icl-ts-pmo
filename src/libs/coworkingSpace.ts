"use server";

import { z } from "zod";
import provinceData from "@/province";
import {
  createCoworkingSpaceAPI,
  deleteCoWorkingSpaceAPI,
  getCoWorkingSpaceAPI,
  getCoworkingSpaceFrequencyAPI,
  getCoWorkingSpacesAPI,
  getCoworkingSpaceTotalReservationAPI,
  updateCoWorkingSpaceAPI,
} from "./api/coworkingSpace";
import { CoworkingSpaceType } from "./types";
import { auth } from "@/auth";
import { Session } from "next-auth";

export async function getCoworkingSpaces(
  page?: number,
  limit?: number,
  search?: string
): Promise<{ success: true; total: number; count: number; data: CoworkingSpaceType[] } | { success: false }> {
  try {
    return await getCoWorkingSpacesAPI(page, limit, search);
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

export async function getCoworkingSpace(
  id: string
): Promise<{ success: true; data: CoworkingSpaceType } | { success: false }> {
  try {
    return getCoWorkingSpaceAPI(id);
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

const editableFields = {
  name: z.string().max(50, { message: "Name can not be more than 50 characters" }),
  description: z.string().max(250, { message: "Description can not be more than 250 characters" }),
  openTime: z.string().datetime(),
  closeTime: z.string().datetime(),
  tel: z.string().optional(),
  picture: z.string().url("Please enter a valid url").optional(),
};

const CreateCoworkingSpaceForm = z
  .object({
    ...editableFields,
    address: z.string(),
    province: z.string(),
    district: z.string(),
    subDistrict: z.string(),
    postalcode: z.string().max(5, { message: "Postal code can not be more than 5 digits" }),
  })
  // TODO: Refactor to use superRefine for more error information
  .refine(
    (schema) =>
      provinceData.find(
        (e) =>
          e.name == schema.province
          && e.amphure.find(
            (e) =>
              e.name == schema.district
              && e.tambon.find(
                (e) => e.name == schema.subDistrict && e.postalCode.toString() == schema.postalcode
              )
          )
      ),
    { message: "Invalid address data" }
  );

export async function createCoworkingSpace(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await CreateCoworkingSpaceForm.safeParseAsync(data);
  if (!validatedFields.success) return { success: false, error: validatedFields.error.flatten(), data };
  try {
    const result = await createCoworkingSpaceAPI(validatedFields.data, session);
    return result.success ? { success: true, data: result.data } : { success: false };
  } catch (error) {
    console.error(error);
  }
  return { success: false, data };
}

const EditCoworkingSpaceForm = z.object(editableFields);
export async function editCoworkingSpace(formState: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  const id = formData.get("id")?.toString();
  if (!id) return { success: false, message: "Invalid input (111)" };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await EditCoworkingSpaceForm.safeParseAsync(data);
  if (!validatedFields.success) return { success: false, error: validatedFields.error.flatten(), data };
  try {
    const response = await updateCoWorkingSpaceAPI(id, validatedFields.data, session);
    if (response.success) return { success: true };
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

export async function deleteCoworkingSpace(id: string) {
  const session = await auth();
  if (!session) return { success: false, message: "unauthorized" };
  try {
    return await deleteCoWorkingSpaceAPI(id, session);
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

export async function getCoworkingSpaceTotalReservation(
  id: string,
  session: Session
): Promise<
  | {
      success: true;
      data: { pending: number; canceled: number; approved: number; rejected: number } & { total: number };
    }
  | { success: false }
> {
  try {
    const result = await getCoworkingSpaceTotalReservationAPI(id, session);
    if (result.success) return { success: true, data: result.data };
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

export async function getCoworkingSpaceFrequency(id: string, session: Session) {
  try {
    const result = await getCoworkingSpaceFrequencyAPI(id, session);
    if (result.success) return { success: true, data: result.data };
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}
