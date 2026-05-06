import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: number;
  username: string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "nuxt-admin-dev-secret";
  }
  return secret;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, getJwtSecret()) as unknown as {
      sub: number;
      username: string;
    };
    return { id: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
