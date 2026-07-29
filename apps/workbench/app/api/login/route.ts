import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "../../../middleware";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const secret = form.get("secret");
  const next = typeof form.get("next") === "string" ? (form.get("next") as string) : "/";

  const expected = process.env.WORKBENCH_SHARED_SECRET;
  if (!expected || secret !== expected) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.redirect(new URL(next || "/", request.url), 303);
}
