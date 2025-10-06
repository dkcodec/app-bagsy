import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST() {
  const refresh = (await cookies()).get("refresh_token")?.value;
  if (!refresh)
    return NextResponse.json({ message: "No refresh" }, { status: 401 });

  const r = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    return NextResponse.json(data || { message: "Unauthorized" }, {
      status: r.status,
    });

  const res = NextResponse.json({ ok: true });

  const isProd = process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookies.set("access_token", data.access_token, {
    ...base,
    maxAge: 60 * 15,
  });
  if (data.refresh_token) {
    res.cookies.set("refresh_token", data.refresh_token, {
      ...base,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}
