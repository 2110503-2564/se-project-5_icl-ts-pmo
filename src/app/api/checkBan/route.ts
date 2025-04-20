import { checkBanAPI } from "@/libs/api/checkBan";
import { NextRequest, NextResponse } from "next/server";

// ? In case for opting checkBan into middleware
export async function POST(request: NextRequest) {
  const data = await request.json();
  const { id } = data;
  return NextResponse.json(await checkBanAPI(id));
}
