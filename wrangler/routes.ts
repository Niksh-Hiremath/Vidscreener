import { getCorsHeaders } from "./utils/cors";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getUserWithRole } from "./utils/user";

export async function handleLogout(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Set-Cookie": "token=; Path=/; HttpOnly; Max-Age=0",
      "Content-Type": "application/json"
    },
  });
}

export async function handleRegister(req: Request, env: Env, db: any) {
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

export async function handleLogin(req: Request, env: Env, db: any) {
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
    const jwt = await new SignJWT({ id: user.id, email: user.email, role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(env.JWT_SECRET));
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

export async function handleCreateOrganization(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req);
  try {
    // Auth: get user from JWT cookie
    const { getUserWithRole } = await import("./utils/user");
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (user.organizationId) {
      return new Response(JSON.stringify({ error: "Already in an organization" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return new Response(JSON.stringify({ error: "Organization name required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    let org;
    try {
      const [createdOrg] = await db.insert(schema.organizations).values({ name, createdBy: user.id }).returning();
      await db.update(schema.users).set({ organizationId: createdOrg.id }).where(eq(schema.users.id, user.id));
      org = createdOrg;
    } catch (e) {
      let message = "Internal server error";
      if (e instanceof Error) message = e.message;
      console.error("/api/organization/create error:", e);
      return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ organization: org }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
}

export async function handleUserProfile(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    let org = null;
    if (user.organizationId) {
      const orgArr = await db.select().from(schema.organizations).where(eq(schema.organizations.id, user.organizationId));
      if (orgArr.length > 0) org = orgArr[0];
    }
    return new Response(JSON.stringify({ user, organization: org }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/user/profile error:", e);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
}
