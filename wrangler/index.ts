import { getDB } from "../db/drizzle";
import * as schema from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

function getJwtSecretKey(env: Env) {
  // Use a TextEncoder to get a Uint8Array for jose
  return new TextEncoder().encode(env.JWT_SECRET);
}

export default {
  async fetch(req: Request, env: Env) {
    // ...existing code...
    const url = new URL(req.url);
    const db = getDB(env);

    // Dynamic CORS headers for credentials: 'include'
    function getCorsHeaders(req: Request) {
      // Only echo the Origin header if present and not '*', else use empty string
      let origin = req.headers.get("Origin") || "";
      // Never allow '*', must be exact origin for credentials
      if (origin === "*") origin = "";
      return {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true"
      };
    }

    // Handle OPTIONS preflight for register and login
    if ((url.pathname === "/api/auth/register" || url.pathname === "/api/auth/login") && req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(req)
      });
    }

    // Logout
    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      const corsHeaders = getCorsHeaders(req);
      // Clear the token cookie by setting Max-Age=0
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Set-Cookie": "token=; Path=/; HttpOnly; Max-Age=0",
          "Content-Type": "application/json"
        },
      });
    }

    // Register
    if (url.pathname === "/api/auth/register" && req.method === "POST") {
      try {
        const { email, password, name, phone, roleName } = await req.json();
        const corsHeaders = getCorsHeaders(req);
        if (!email || !password || !name || !roleName) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (existing.length > 0) {
          return new Response(JSON.stringify({ error: "User already exists" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Always use lowercase for role lookup
        const role = await db.select().from(schema.roles).where(eq(schema.roles.name, roleName.toLowerCase()));
        if (role.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const hashed = await bcrypt.hash(password, 10);
        await db.insert(schema.users).values({ email, password: hashed, name, phone, roleId: role[0].id });
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        const corsHeaders = getCorsHeaders(req);
        return new Response(JSON.stringify({ error: "Registration failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Login
    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      try {
        const { email, password } = await req.json();
        const corsHeaders = getCorsHeaders(req);
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Missing credentials" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const userArr = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (userArr.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const user = userArr[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const roleArr = await db.select().from(schema.roles).where(eq(schema.roles.id, user.roleId));
        const role = roleArr[0]?.name || "Unknown";
        // Use jose to sign JWT
        const jwt = await new SignJWT({ id: user.id, email: user.email, role })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(getJwtSecretKey(env));
        // Set cookie header
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Set-Cookie": `token=${jwt}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}`,
            "Content-Type": "application/json"
          },
        });
      } catch (e) {
        const corsHeaders = getCorsHeaders(req);
        return new Response(JSON.stringify({ error: "Login failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Default: Not found
    return new Response("Not found", { status: 404 });
  }
};
