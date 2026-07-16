import type { NextConfig } from "next";

/** Keep in sync with `lib/base-path.ts` default. */
const basePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "development" ? "" : "/SES")
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
