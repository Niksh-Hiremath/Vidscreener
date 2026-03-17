import { getDB } from "../db/drizzle";
import { getCorsHeaders } from "./utils/cors";
import { handleRegister, handleLogin, handleLogout, handleCreateOrganization, handleUserProfile } from "./routes";

export default {
  async fetch(req: Request, env: Env) {
    // ...existing code...
    const url = new URL(req.url);
    const db = getDB(env);

    // Handle OPTIONS preflight requests for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(req)
      });
    }


    // Logout
    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      return handleLogout(req, env, db);
    }

    // Register
    if (url.pathname === "/api/auth/register" && req.method === "POST") {
      return handleRegister(req, env, db);
    }

    // Login
    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      return handleLogin(req, env, db);
    }

    // Organization creation (admin only)
    if (url.pathname === "/api/organization/create" && req.method === "POST") {
      return handleCreateOrganization(req, env, db);
    }

    // User profile (with org info and role)
    if (url.pathname === "/api/user/profile" && req.method === "GET") {
      return handleUserProfile(req, env, db);
    }

    // Default: Not found
    return new Response("Not found", { status: 404 });
  }
};
