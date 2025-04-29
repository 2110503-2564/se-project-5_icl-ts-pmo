"use server";

import { Session } from "next-auth";
import { UserType } from "../types";

type AuthResponse =
  | {
      success: true;
      token: string;
      data: { _id: string; name: string; email: string; role: "user" | "admin" };
    }
  | { success: false; data: null };

export async function registerAPI(payload: {
  [P in "name" | "email" | "phone" | "password"]: string;
}): Promise<AuthResponse> {
  return (await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-cache",
  }).then((e) => e.json())) as AuthResponse;
}

export async function loginAPI(payload: { email: string; password: string }): Promise<AuthResponse> {
  return (await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-cache",
  }).then((e) => e.json())) as AuthResponse;
}

export async function checkBanAPI(
  session: Session
): Promise<{ success: true; isBanned: boolean } | { success: false; isBanned: true }> {
  return (await fetch(`${process.env.API_URL}/auth/checkBan`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    cache: "no-cache",
  }).then((e) => e.json())) as { success: true; isBanned: boolean } | { success: false; isBanned: true };
}

export async function GetUserAPI(
  id: string
): Promise<{ success: true; data: UserType } | { success: false }> {
  return (await fetch(`${process.env.API_URL}/users/${id}`, {
    method: "GET",
    next: { revalidate: 300 },
  }).then((e) => e.json())) as { success: true; data: UserType } | { success: false };
}
