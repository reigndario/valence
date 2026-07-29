import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "../../../middleware";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
