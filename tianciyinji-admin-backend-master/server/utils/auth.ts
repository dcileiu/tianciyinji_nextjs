import type { H3Event } from "h3";
import { getHeader, createError } from "h3";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: number;
  username: string;
}

export function requireUser(event: H3Event): AuthUser {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const config = useRuntimeConfig();
    const secret = (config.JWT_SECRET as string) || "nuxt-admin-dev-secret";
    const payload = jwt.verify(token, secret) as {
      sub: number;
      username: string;
    };

    return {
      id: payload.sub,
      username: payload.username,
    };
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
}

