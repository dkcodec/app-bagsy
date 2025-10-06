import { LoginRequest, LoginResponse } from "../types";
import { ApiError } from "@/src/shared/api";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!r.ok) throw new ApiError("Login failed", r.status);
    return r.json();
  },

  async logout(): Promise<void> {
    const r = await fetch("/api/auth/logout", { method: "POST" });
    if (!r.ok) throw new ApiError("Logout failed", r.status);
  },
};
