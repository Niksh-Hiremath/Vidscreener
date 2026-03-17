export function getJwtSecretKey(env: Env) {
  return new TextEncoder().encode(env.JWT_SECRET);
}
