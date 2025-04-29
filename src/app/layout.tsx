import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import SnackbarProvider from "@/provider/SnackbarProvider";
import TopMenu from "@/components/TopMenu";
import "./globals.css";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "icl ts pmo",
  description: "The coolest CoworkingSpace Reservation app",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="mt-12">
        <SessionProvider session={session}>
          <SnackbarProvider>
            <TopMenu session={session} />
            {children}
          </SnackbarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
