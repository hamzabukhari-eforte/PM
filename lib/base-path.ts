/**
 * Must match `basePath` in next.config.ts.
 * Empty for `next`dev`; `/SES/PM` for production static builds (Tomcat).
 */
export const BASE_PATH = (
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/SES" : "")
).replace(/\/$/, "");
