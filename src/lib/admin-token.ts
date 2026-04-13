const COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 24 * 7;

export function persistAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`;
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0`;
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
