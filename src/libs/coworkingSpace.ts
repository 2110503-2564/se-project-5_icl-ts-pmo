"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { FilterQuery } from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "./db/dbConnect";
import CoworkingSpace, { CWS } from "./db/models/CoworkingSpace";
import Reservation from "./db/models/Reservation";
import provinceData from "@/province";

export const getCoworkingSpaces = unstable_cache(
  async (filter: FilterQuery<CWS> = {}, page: number = 0, limit: number = 15) => {
    await dbConnect();
    try {
      const [total, coworkingSpaces] = await Promise.all([
        CoworkingSpace.countDocuments(filter),
        CoworkingSpace.find(filter, {}, { skip: page * limit, limit }),
      ]);
      return {
        success: true,
        total,
        count: coworkingSpaces.length,
        data: coworkingSpaces.map((e) => e.toObject()),
      };
    } catch (error) {
      console.error(error);
    }
    return { success: false };
  },
  undefined,
  { tags: ["coworkingSpaces"], revalidate: 60 }
);

export const getCoworkingSpace = unstable_cache(
  async (id: string) => {
    await dbConnect();
    try {
      const coworkingSpace = await CoworkingSpace.findById(id);
      if (coworkingSpace) return { success: true, data: coworkingSpace.toObject() };
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  },
  undefined,
  { tags: ["coworkingSpaces"], revalidate: 300 }
);

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
  if (!session) return { success: false };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await CreateCoworkingSpaceForm.safeParseAsync(data);
  if (validatedFields.success) {
    await dbConnect();
    try {
      const coworkingSpace = await CoworkingSpace.create({ ...validatedFields.data, owner: session.user.id });
      if (coworkingSpace) {
        revalidateTag("coworkingSpaces");
        return { success: true, data: coworkingSpace.toObject() };
      }
    } catch (error) {
      // TODO: Show error message from database to user
      console.error(error);
    }
    return { success: false, data };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

const EditCoworkingSpaceForm = z.object(editableFields);
export async function editCoworkingSpace(formState: unknown, formData: FormData) {
  const session = await auth();
  const id = formData.get("id")?.toString();
  if (!session || !id) return { success: false };
  const data = Object.fromEntries(formData.entries());
  const validatedFields = await EditCoworkingSpaceForm.safeParseAsync(data);
  await dbConnect();
  if (validatedFields.success) {
    try {
      const coworkingSpace = (await CoworkingSpace.findById(id))?.toObject();
      if (!coworkingSpace) return { success: false, message: "Coworking Space not found", data };
      if (coworkingSpace.owner != session.user.id)
        return { success: false, message: "You are not this coworking space owner", data };
      const updatedCoworkingSpace = await CoworkingSpace.findByIdAndUpdate(id, validatedFields.data, {
        new: true,
        runValidator: true,
      });
      if (updatedCoworkingSpace) {
        revalidateTag("coworkingSpaces");
        return { success: true, data: updatedCoworkingSpace.toObject() };
      }
    } catch (error) {
      // TODO: Show error message from database to user
      console.error(error);
    }
    return { success: false };
  }
  return { success: false, error: validatedFields.error.flatten(), data };
}

export async function deleteCoworkingSpace(id: string) {
  const session = await auth();
  if (!session) return { success: false };
  await dbConnect();
  try {
    const coworkingSpace = (await CoworkingSpace.findById(id))?.toObject();
    if (!coworkingSpace) return { success: false, message: "Coworking Space not found" };
    if (coworkingSpace.owner != session.user.id)
      return { success: false, message: "You are not this coworking space owner" };
    const [result] = await Promise.all([
      CoworkingSpace.deleteOne({ _id: id }),
      Reservation.deleteMany({ coworkingSpace: id }),
    ]);
    if (result.acknowledged) {
      revalidateTag("coworkingSpaces");
      revalidateTag("reservations");
      return { success: true };
    }
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}
