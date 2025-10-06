import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "Server misconfiguration: API URL missing" },
      { status: 500 }
    );
  }

  let r: Response;
  try {
    r = await fetch(`${BACKEND_URL}v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch (e) {
    return NextResponse.json(
      { message: "Upstream unavailable" },
      { status: 502 }
    );
  }

  const data: any = await r.json().catch(() => ({}));

  if (!r.ok) {
    return NextResponse.json(data || { message: "Login failed" }, {
      status: r.status,
    });
  }

  if (!data?.access_token || !data?.refresh_token) {
    return NextResponse.json(
      { message: "Invalid auth response" },
      { status: 502 }
    );
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
