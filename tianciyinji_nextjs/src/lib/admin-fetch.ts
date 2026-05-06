import { clearAdminToken } from "./admin-token";

function redirectLogin() {
  if (typeof window !== "undefined") {
    clearAdminToken();
    window.location.href = "/admin/login";
  }
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(init?.headers);
  const isForm = init?.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, { ...init, headers });

  if (res.status === 401) {
    redirectLogin();
    throw new Error("Unauthorized");
  }

  return res.json() as Promise<T>;
}
