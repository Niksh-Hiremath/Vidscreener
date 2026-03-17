export function getCorsHeaders(req: Request) {
  let origin = req.headers.get("Origin") || "";
  if (origin === "*") origin = "";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true"
  };
}
