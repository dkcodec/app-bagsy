import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!; // например, https://api.bagsy.kz

async function forward(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  const target = `${BACKEND_URL}/${path.join("/")}${url.search}`;

  const access = (await cookies()).get("access_token")?.value;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "content-type": req.headers.get("content-type") || "",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await req.arrayBuffer(),
    cache: "no-store",
  };

  let r = await fetch(target, init);

  // авто-рефреш: один раз пробуем обновить и повторить запрос
  if (r.status === 401) {
    const refreshed = await fetch(
      new URL("/api/auth/refresh", url).toString(),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      }
    );

    if (refreshed.ok) {
      const newAccess = (await cookies()).get("access_token")?.value;
      r = await fetch(target, {
        ...init,
        headers: {
          ...init.headers,
          ...(newAccess ? { Authorization: `Bearer ${newAccess}` } : {}),
        },
      });
    }
  }

  // Проксируем ответ как есть
  const res = new NextResponse(r.body, { status: r.status });
  r.headers.forEach((v, k) => {
    if (
      !["content-security-policy", "set-cookie", "transfer-encoding"].includes(
        k.toLowerCase()
      )
    ) {
      res.headers.set(k, v);
    }
  });
  return res;
}

export const GET = (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => forward(req, params.path);
export const POST = (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => forward(req, params.path);
export const PUT = (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => forward(req, params.path);
export const PATCH = (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => forward(req, params.path);
export const DELETE = (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => forward(req, params.path);
