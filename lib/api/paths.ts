export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/$/, "");

/** Build same-origin API URL (no trailing slash — keeps MSW paths in sync when query strings are used). */
export function apiPath(relativePath: string, query?: string): string {
  const segment = relativePath.replace(/^\/+|\/+$/g, "");
  const url = segment ? `${API_BASE}/${segment}` : API_BASE;
  if (!query) return url;
  return `${url}?${query.replace(/^\?/, "")}`;
}
