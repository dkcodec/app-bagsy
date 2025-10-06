import { NextResponse } from "next/server";
const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(req: Request) {
  const body = await req.json();

  const r = await fetch(`${BACKEND_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    return NextResponse.json(data || { message: "Login failed" }, {
      status: r.status,
    });
  }

  const res = NextResponse.json({ ok: true, user: data.user ?? null });

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
  res.cookies.set("refresh_token", data.refresh_token, {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
