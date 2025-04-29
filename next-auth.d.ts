/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { _id: string; name: string; email: string; role: "user" | "admin"; token: string };
  }
}
