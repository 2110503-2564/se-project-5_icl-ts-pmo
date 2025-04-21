"use server";

import { Session } from "next-auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/libs/db/dbConnect";
import User from "@/libs/db/models/User";

// authjs middleware edge runtime bypass
export async function checkValidityAPI(
  email: string,
  password: string
): Promise<{ data: Session["user"] | null }> {
  await dbConnect();
  try {
    if (email && password) {
      const user = await User.findOne({ email }).select("+password");
      if (user && (await bcrypt.compare(password, user.password))) {
        const { _id, name, email, role } = user.toObject();
        return { data: { id: _id, name, email, role } };
      }
    }
  } catch (error) {
    console.error(error);
  }
  return { data: null };
}
