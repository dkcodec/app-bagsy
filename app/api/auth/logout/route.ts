import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const base = { httpOnly: true, path: "/" as const };
  res.cookies.set("access_token", "", { ...base, maxAge: 0 });
  res.cookies.set("refresh_token", "", { ...base, maxAge: 0 });
  return res;
}
