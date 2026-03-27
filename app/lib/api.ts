const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

export { WORKER_API_BASE_URL };
