import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginAPI } from "./libs/api/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // already validated when called in @libs/auth
        const email = credentials.email as string;
        const password = credentials.password as string;
        const response = await loginAPI({ email, password });
        return response.success ? { ...response.data, token: response.token } : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.user = token as any;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
