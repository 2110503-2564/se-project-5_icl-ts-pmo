/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string; role: "user" | "admin" };
  }
}
