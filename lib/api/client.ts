import { BASE_PATH } from "@/lib/base-path";
import { useAuthStore } from "@/lib/stores/auth-store";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

function normalizeApiUrl(url: string): string {
  const [path, query] = url.split("?");
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

export async function apiClient<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const response = await fetch(normalizeApiUrl(url), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.location.href = `${BASE_PATH}/login/`;
    }
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
