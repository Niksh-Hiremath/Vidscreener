const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function getAllowedOrigins(env?: Env) {
  const configured = (env as Record<string, string | undefined> | undefined)
    ?.ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

export function getCorsHeaders(req: Request, env?: Env) {
  const origin = req.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  const isAllowedOrigin = !!origin && allowedOrigins.includes(origin);

  return {
    ...(isAllowedOrigin ? { "Access-Control-Allow-Origin": origin } : {}),
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers":
      req.headers.get("Access-Control-Request-Headers") ||
      "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}
