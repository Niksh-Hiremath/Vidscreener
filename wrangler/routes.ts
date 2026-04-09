import { getCorsHeaders } from "./utils/cors";
import * as schema from "../db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getUserWithRole } from "./utils/user";

const ALLOWED_ATTACHMENT_TYPES = ["images", "pdf", "video", "zip"] as const;
type AttachmentType = (typeof ALLOWED_ATTACHMENT_TYPES)[number];

function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function json(data: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAdminRoleId(db: any) {
  const roleArr = await db.select().from(schema.roles).where(eq(schema.roles.name, "admin"));
  if (roleArr.length === 0) {
    throw new Error("Admin role is missing. Seed roles first.");
  }
  return roleArr[0].id;
}

async function getOrganizationById(db: any, organizationId: number) {
  const orgArr = await db.select().from(schema.organizations).where(eq(schema.organizations.id, organizationId));
  return orgArr[0] || null;
}

async function getOrganizationAdmins(db: any, organizationId: number) {
  const adminRoleId = await getAdminRoleId(db);
  const admins = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.organizationId, organizationId), eq(schema.users.roleId, adminRoleId)));
  return admins;
}

async function enrichEvaluatorsWithProfileName(db: any, evaluators: any[]) {
  if (!evaluators.length) return [];

  const userIds = [...new Set(evaluators.map((evaluator: any) => evaluator.userId).filter(Boolean))];
  const emails = [...new Set(evaluators.map((evaluator: any) => evaluator.email).filter(Boolean))];

  const usersById = userIds.length
    ? await db.select().from(schema.users).where(inArray(schema.users.id, userIds))
    : [];
  const usersByEmail = emails.length
    ? await db.select().from(schema.users).where(inArray(schema.users.email, emails))
    : [];
  const users = [...usersById, ...usersByEmail];

  const userNameById = new Map<number, string>(
    users.map((profileUser: any) => [profileUser.id, profileUser.name || ""])
  );
  const userNameByEmail = new Map<string, string>(
    users.map((profileUser: any) => [profileUser.email, profileUser.name || ""])
  );

  return evaluators.map((evaluator: any) => ({
    ...evaluator,
    name:
      (evaluator.userId ? userNameById.get(evaluator.userId) : null) ||
      userNameByEmail.get(evaluator.email) ||
      evaluator.name ||
      null,
  }));
}

export async function handleLogout(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Set-Cookie": "token=; Path=/; HttpOnly; Max-Age=0",
      "Content-Type": "application/json",
    },
  });
}

export async function handleRegister(req: Request, env: Env, db: any) {
  try {
    const { email, password, name, phone, roleName } = await req.json();
    const corsHeaders = getCorsHeaders(req, env);
    if (!email || !password || !name || !roleName) {
      return json({ error: "Missing required fields" }, 400, corsHeaders);
    }
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (existing.length > 0) {
      return json({ error: "User already exists" }, 409, corsHeaders);
    }
    const role = await db.select().from(schema.roles).where(eq(schema.roles.name, roleName.toLowerCase()));
    if (role.length === 0) {
      return json({ error: "Invalid role" }, 400, corsHeaders);
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.insert(schema.users).values({ email, password: hashed, name, phone, roleId: role[0].id });
    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    const corsHeaders = getCorsHeaders(req, env);
    return json({ error: "Registration failed" }, 500, corsHeaders);
  }
}

export async function handleLogin(req: Request, env: Env, db: any) {
  try {
    const { email, password } = await req.json();
    const corsHeaders = getCorsHeaders(req, env);
    if (!email || !password) {
      return json({ error: "Missing credentials" }, 400, corsHeaders);
    }
    const userArr = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (userArr.length === 0) {
      return json({ error: "Invalid credentials" }, 401, corsHeaders);
    }
    const user = userArr[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return json({ error: "Invalid credentials" }, 401, corsHeaders);
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
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    const corsHeaders = getCorsHeaders(req, env);
    return json({ error: "Login failed" }, 500, corsHeaders);
  }
}

export async function handleForgotPassword(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return json({ error: "Email is required" }, 400, corsHeaders);
    }

    const userArr = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase().trim()));
    if (userArr.length === 0) {
      // Deliberately return success to avoid email enumeration
      return json({ success: true, message: "If an account with that email exists, a reset link has been sent." }, 200, corsHeaders);
    }

    // Invalidate any existing tokens for this user
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(schema.passwordResetTokens.userId, userArr[0].id));

    // Generate a secure random token (sent to email in production)
    const token = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(token, 8);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await db.insert(schema.passwordResetTokens).values({
      userId: userArr[0].id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Log the reset link — in production, replace with an email service (Resend, Mailgun, etc.)
    console.log(`[PASSWORD RESET] For ${email}: ${resetUrl}`);

    return json(
      { success: true, message: "If an account with that email exists, a reset link has been sent." },
      200,
      corsHeaders
    );
  } catch (e) {
    console.error("[handleForgotPassword]", e);
    return json({ error: "Failed to process request" }, 500, corsHeaders);
  }
}

export async function handleResetPassword(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return json({ error: "Token, email, and new password are required" }, 400, corsHeaders);
    }
    if (password.length < 8) {
      return json({ error: "Password must be at least 8 characters" }, 400, corsHeaders);
    }

    const userArr = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase().trim()));
    if (userArr.length === 0) {
      return json({ error: "Invalid token or email" }, 400, corsHeaders);
    }
    const user = userArr[0];

    // Find the token record (only unused tokens)
    const tokenRecords = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(and(
        eq(schema.passwordResetTokens.userId, user.id),
        isNull(schema.passwordResetTokens.usedAt)
      ));

    let validToken = false;
    for (const record of tokenRecords) {
      const isValid = await bcrypt.compare(token, record.tokenHash);
      if (isValid && new Date(record.expiresAt) > new Date()) {
        validToken = true;
        break;
      }
    }

    if (!validToken) {
      return json({ error: "Token is invalid or has expired" }, 400, corsHeaders);
    }

    // Mark token as used
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(and(
        eq(schema.passwordResetTokens.userId, user.id),
        isNull(schema.passwordResetTokens.usedAt)
      ));

    // Update password
    const hashed = await bcrypt.hash(password, 10);
    await db.update(schema.users).set({ password: hashed }).where(eq(schema.users.id, user.id));

    return json({ success: true, message: "Password has been reset. You can now log in." }, 200, corsHeaders);
  } catch (e) {
    console.error("[handleResetPassword]", e);
    return json({ error: "Failed to reset password" }, 500, corsHeaders);
  }
}

export async function handleCreateOrganization(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin") {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    if (user.organizationId) {
      return json({ error: "Already in an organization" }, 400, corsHeaders);
    }
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return json({ error: "Organization name required" }, 400, corsHeaders);
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
      return json({ error: message }, 500, corsHeaders);
    }
    return json({ organization: org }, 201, corsHeaders);
  } catch (e) {
    return json({ error: "Internal server error" }, 500, corsHeaders);
  }
}

export async function handleUserProfile(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    let org = null;
    let isSuperAdmin = false;
    if (user.organizationId) {
      const orgArr = await db.select().from(schema.organizations).where(eq(schema.organizations.id, user.organizationId));
      if (orgArr.length > 0) org = orgArr[0];
      if (org) isSuperAdmin = org.createdBy === user.id;
    }
    return json({ user: sanitizeUser(user), organization: org, isSuperAdmin }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/user/profile error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleUpdateUserProfile(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return json({ error: "Name is required" }, 400, corsHeaders);
    }
    if (name.length > 80) {
      return json({ error: "Name must be 80 characters or fewer" }, 400, corsHeaders);
    }

    await db.update(schema.users).set({ name }).where(eq(schema.users.id, user.id));
    const updatedRows = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
    const updatedUser = updatedRows[0];

    return json({ user: sanitizeUser(updatedUser) }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/user/profile update error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleChangePassword(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return json({ error: "Current password and new password are required" }, 400, corsHeaders);
    }
    if (newPassword.length < 8) {
      return json({ error: "New password must be at least 8 characters" }, 400, corsHeaders);
    }

    const userRows = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
    if (userRows.length === 0) {
      return json({ error: "User not found" }, 404, corsHeaders);
    }
    const userRecord = userRows[0];

    const valid = await bcrypt.compare(currentPassword, userRecord.password);
    if (!valid) {
      return json({ error: "Current password is incorrect" }, 400, corsHeaders);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(schema.users).set({ password: hashed }).where(eq(schema.users.id, user.id));

    return json({ success: true, message: "Password updated successfully" }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/user/change-password error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleOrganizationAdmins(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }

    const admins = await getOrganizationAdmins(db, organization.id);
    const isSuperAdmin = organization.createdBy === user.id;

    return json(
      {
        organization: {
          id: organization.id,
          name: organization.name,
          superAdminUserId: organization.createdBy,
        },
        isSuperAdmin,
        admins: admins.map((admin: any) => ({
          ...sanitizeUser(admin),
          role: "admin",
          isSuperAdmin: admin.id === organization.createdBy,
        })),
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/admins error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAddOrganizationAdmin(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }
    if (organization.createdBy !== user.id) {
      return json({ error: "Only superadmin can add admins" }, 403, corsHeaders);
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;

    if (!email) {
      return json({ error: "Email is required" }, 400, corsHeaders);
    }

    const adminRoleId = await getAdminRoleId(db);
    const existingUsers = await db.select().from(schema.users).where(eq(schema.users.email, email));
    const existingUser = existingUsers[0];

    if (existingUser) {
      if (existingUser.organizationId && existingUser.organizationId !== organization.id) {
        return json({ error: "User belongs to another organization" }, 409, corsHeaders);
      }
      if (existingUser.organizationId === organization.id && existingUser.roleId === adminRoleId) {
        return json({ error: "User is already an admin in this organization" }, 400, corsHeaders);
      }

      await db
        .update(schema.users)
        .set({
          organizationId: organization.id,
          roleId: adminRoleId,
          ...(phone ? { phone } : {}),
          ...(name ? { name } : {}),
        })
        .where(eq(schema.users.id, existingUser.id));

      const updated = await db.select().from(schema.users).where(eq(schema.users.id, existingUser.id));
      return json({ admin: { ...sanitizeUser(updated[0]), role: "admin", isSuperAdmin: false } }, 201, corsHeaders);
    }

    if (!name || !password) {
      return json({ error: "Name and password are required for new users" }, 400, corsHeaders);
    }

    const hashed = await bcrypt.hash(password, 10);
    const [created] = await db
      .insert(schema.users)
      .values({
        email,
        password: hashed,
        name,
        phone,
        roleId: adminRoleId,
        organizationId: organization.id,
      })
      .returning();

    return json({ admin: { ...sanitizeUser(created), role: "admin", isSuperAdmin: false } }, 201, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/admins/add error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleRemoveOrganizationAdmin(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }
    if (organization.createdBy !== user.id) {
      return json({ error: "Only superadmin can remove admins" }, 403, corsHeaders);
    }

    const { adminUserId } = await req.json();
    if (typeof adminUserId !== "number") {
      return json({ error: "adminUserId is required" }, 400, corsHeaders);
    }
    if (adminUserId === organization.createdBy) {
      return json({ error: "Superadmin cannot be removed. Transfer superadmin first." }, 400, corsHeaders);
    }

    const adminRoleId = await getAdminRoleId(db);
    const targetArr = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, adminUserId), eq(schema.users.organizationId, organization.id)));

    if (targetArr.length === 0) {
      return json({ error: "Admin not found in organization" }, 404, corsHeaders);
    }

    const target = targetArr[0];
    if (target.roleId !== adminRoleId) {
      return json({ error: "Target user is not an admin" }, 400, corsHeaders);
    }

    await db.update(schema.users).set({ organizationId: null }).where(eq(schema.users.id, adminUserId));
    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/admins/remove error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

async function getRoleName(db: any, roleId: number): Promise<string> {
  const roleArr = await db.select().from(schema.roles).where(eq(schema.roles.id, roleId));
  return roleArr[0]?.name || "unknown";
}

async function getAllRoles(db: any): Promise<Map<number, string>> {
  const all = await db.select().from(schema.roles);
  return new Map(all.map((r: any) => [r.id, r.name]));
}

export async function handleOrganizationUsers(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }

    const roleMap = await getAllRoles(db);
    const orgUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.organizationId, organization.id));

    return json(
      {
        users: orgUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          roleId: u.roleId,
          role: roleMap.get(u.roleId) || "unknown",
          isSuperAdmin: u.id === organization.createdBy,
          createdAt: u.createdAt,
        })),
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/users error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleUpdateUserRole(req: Request, env: Env, db: any, userId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const currentUser = await getUserWithRole(req, env, db);
    if (!currentUser || currentUser.role !== "admin" || !currentUser.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, currentUser.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }

    const isSuperAdmin = organization.createdBy === currentUser.id;

    const body = await req.json();
    const newRoleName = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";

    const validRoles = ["admin", "evaluator", "submitter"];
    if (!validRoles.includes(newRoleName)) {
      return json({ error: `Role must be one of: ${validRoles.join(", ")}` }, 400, corsHeaders);
    }

    // Find target user in org
    const targetArr = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, userId), eq(schema.users.organizationId, organization.id)));
    if (targetArr.length === 0) {
      return json({ error: "User not found in organization" }, 404, corsHeaders);
    }
    const target = targetArr[0];

    // Can't change superadmin's role unless you're the superadmin
    if (target.id === organization.createdBy && !isSuperAdmin) {
      return json({ error: "Only superadmin can change superadmin role" }, 403, corsHeaders);
    }

    // Only superadmin can create/remove admins
    if (newRoleName === "admin" && !isSuperAdmin) {
      return json({ error: "Only superadmin can assign admin role" }, 403, corsHeaders);
    }

    const roleArr = await db.select().from(schema.roles).where(eq(schema.roles.name, newRoleName));
    if (roleArr.length === 0) {
      return json({ error: `Role '${newRoleName}' does not exist` }, 400, corsHeaders);
    }

    await db.update(schema.users).set({ roleId: roleArr[0].id }).where(eq(schema.users.id, userId));

    return json(
      {
        success: true,
        user: {
          id: target.id,
          name: target.name,
          email: target.email,
          role: newRoleName,
          isSuperAdmin: target.id === organization.createdBy,
        },
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/users/update-role error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleDeleteUser(req: Request, env: Env, db: any, userId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const currentUser = await getUserWithRole(req, env, db);
    if (!currentUser || currentUser.role !== "admin" || !currentUser.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, currentUser.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }

    const isSuperAdmin = organization.createdBy === currentUser.id;

    const targetArr = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, userId), eq(schema.users.organizationId, organization.id)));
    if (targetArr.length === 0) {
      return json({ error: "User not found in organization" }, 404, corsHeaders);
    }
    const target = targetArr[0];

    // Can't delete yourself
    if (target.id === currentUser.id) {
      return json({ error: "You cannot delete yourself" }, 400, corsHeaders);
    }

    // Can't delete superadmin unless you're the superadmin
    if (target.id === organization.createdBy && !isSuperAdmin) {
      return json({ error: "Only superadmin can delete superadmin account" }, 403, corsHeaders);
    }

    // Remove user from org (rather than hard delete, to preserve FK integrity)
    await db.update(schema.users).set({ organizationId: null }).where(eq(schema.users.id, userId));

    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/users/delete error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleRenameOrganization(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }
    if (organization.createdBy !== user.id) {
      return json({ error: "Only superadmin can rename organization" }, 403, corsHeaders);
    }

    const { name } = await req.json();
    const nextName = typeof name === "string" ? name.trim() : "";
    if (!nextName) {
      return json({ error: "Organization name is required" }, 400, corsHeaders);
    }

    await db.update(schema.organizations).set({ name: nextName }).where(eq(schema.organizations.id, organization.id));
    return json({ success: true, organization: { ...organization, name: nextName } }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/rename error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleTransferSuperadmin(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }
    if (organization.createdBy !== user.id) {
      return json({ error: "Only superadmin can transfer superadmin" }, 403, corsHeaders);
    }

    const { newSuperadminUserId } = await req.json();
    if (typeof newSuperadminUserId !== "number") {
      return json({ error: "newSuperadminUserId is required" }, 400, corsHeaders);
    }
    if (newSuperadminUserId === user.id) {
      return json({ error: "Choose another admin to transfer superadmin" }, 400, corsHeaders);
    }

    const adminRoleId = await getAdminRoleId(db);
    const targetArr = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, newSuperadminUserId), eq(schema.users.organizationId, organization.id)));
    if (targetArr.length === 0) {
      return json({ error: "Target admin not found in organization" }, 404, corsHeaders);
    }
    if (targetArr[0].roleId !== adminRoleId) {
      return json({ error: "Target user is not an admin" }, 400, corsHeaders);
    }

    await db.update(schema.organizations).set({ createdBy: newSuperadminUserId }).where(eq(schema.organizations.id, organization.id));
    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/superadmin/transfer error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleExitOrganization(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const organization = await getOrganizationById(db, user.organizationId);
    if (!organization) {
      return json({ error: "Organization not found" }, 404, corsHeaders);
    }

    if (organization.createdBy === user.id) {
      const admins = await getOrganizationAdmins(db, organization.id);
      const candidates = admins
        .filter((admin: any) => admin.id !== user.id)
        .map((admin: any) => sanitizeUser(admin));
      return json(
        {
          error: "Superadmin must transfer superadmin to another admin before exiting.",
          transferCandidates: candidates,
        },
        400,
        corsHeaders
      );
    }

    await db.update(schema.users).set({ organizationId: null }).where(eq(schema.users.id, user.id));
    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/organization/exit error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectsList(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const projects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.organizationId, user.organizationId));

    const projectIds = projects.map((project: any) => project.id);
    const submissionCountByProjectId = new Map<number, number>();
    const evaluatorCountByProjectId = new Map<number, number>();

    if (projectIds.length > 0) {
      const submissions = await db
        .select()
        .from(schema.projectFormSubmissions)
        .where(inArray(schema.projectFormSubmissions.projectId, projectIds));
      submissions.forEach((submission: any) => {
        const existing = submissionCountByProjectId.get(submission.projectId) || 0;
        submissionCountByProjectId.set(submission.projectId, existing + 1);
      });

      const projectEvaluators = await db
        .select()
        .from(schema.projectEvaluators)
        .where(inArray(schema.projectEvaluators.projectId, projectIds));
      projectEvaluators.forEach((projectEvaluator: any) => {
        const existing = evaluatorCountByProjectId.get(projectEvaluator.projectId) || 0;
        evaluatorCountByProjectId.set(projectEvaluator.projectId, existing + 1);
      });
    }

    const totalProjects = projects.length;
    const activeProjects = projects.filter((project: any) => project.status === "active").length;

    return json(
      {
        projects: projects.map((project: any) => ({
          ...project,
          submissionsCount: submissionCountByProjectId.get(project.id) || 0,
          evaluatorsCount: evaluatorCountByProjectId.get(project.id) || 0,
        })),
        summary: {
          totalProjects,
          activeProjects,
        },
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/projects error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleCreateProject(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const { name, description } = await req.json();
    const projectName = typeof name === "string" ? name.trim() : "";
    const projectDescription = typeof description === "string" ? description.trim() : null;

    if (!projectName) {
      return json({ error: "Project name is required" }, 400, corsHeaders);
    }
    const nowIso = new Date().toISOString();

    const [created] = await db
      .insert(schema.projects)
      .values({
        organizationId: user.organizationId,
        name: projectName,
        description: projectDescription,
        status: "active",
        createdBy: user.id,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      .returning();

    return json({ project: created }, 201, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/projects/create error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectDetail(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const projects = await db
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.id, projectId), eq(schema.projects.organizationId, user.organizationId)));
    const project = projects[0];

    if (!project) {
      return json({ error: "Project not found" }, 404, corsHeaders);
    }

    return json({ project }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId} error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleUpdateProject(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) {
      return json({ error: "Project not found" }, 404, corsHeaders);
    }

    const body = await req.json();
    const { name, description, status } = body;

    const updates: Record<string, unknown> = {};
    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) return json({ error: "Name cannot be empty" }, 400, corsHeaders);
      if (trimmed.length > 120) return json({ error: "Name must be 120 characters or fewer" }, 400, corsHeaders);
      updates.name = trimmed;
    }
    if (typeof description === "string") {
      updates.description = description.trim() || null;
    }
    if (typeof status === "string") {
      if (!["active", "paused", "archived", "closed"].includes(status)) {
        return json({ error: "Invalid status. Must be: active, paused, archived, or closed" }, 400, corsHeaders);
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return json({ error: "No valid fields to update" }, 400, corsHeaders);
    }

    await db
      .update(schema.projects)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(schema.projects.id, projectId));

    const updatedRows = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
    return json({ project: updatedRows[0] }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId} PATCH error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleDeleteProject(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) {
      return json({ error: "Project not found" }, 404, corsHeaders);
    }

    // Gather all child records for cascade delete
    const [rubrics, forms, submissions, formShareRows, projectVideoRows] = await Promise.all([
      db.select().from(schema.projectRubrics).where(eq(schema.projectRubrics.projectId, projectId)),
      db.select().from(schema.projectForms).where(eq(schema.projectForms.projectId, projectId)),
      db.select().from(schema.projectFormSubmissions).where(eq(schema.projectFormSubmissions.projectId, projectId)),
      db.select().from(schema.projectFormShares).where(eq(schema.projectFormShares.projectId, projectId)),
      db.select().from(schema.projectVideos).where(eq(schema.projectVideos.projectId, projectId)),
    ]);

    const submissionIds = submissions.map((s: any) => s.id);
    const formIds = forms.map((f: any) => f.id);
    const rubricIds = rubrics.map((r: any) => r.id);
    const formShareIds = formShareRows.map((fs: any) => fs.id);
    const projectVideoIds = projectVideoRows.map((v: any) => v.id);

    // Delete attachments (R2 files) for each submission
    if (submissionIds.length > 0) {
      const attachments = await db
        .select()
        .from(schema.projectFormSubmissionAttachments)
        .where(inArray(schema.projectFormSubmissionAttachments.submissionId, submissionIds));
      for (const attachment of attachments) {
        if (attachment.r2Key && env.BUCKET) {
          try { await env.BUCKET.delete(attachment.r2Key); } catch { /* R2 delete is best-effort */ }
        }
      }
      await db
        .delete(schema.projectFormSubmissionAttachments)
        .where(inArray(schema.projectFormSubmissionAttachments.submissionId, submissionIds));
    }

    if (projectVideoIds.length > 0) {
      await db.delete(schema.projectVideos).where(inArray(schema.projectVideos.id, projectVideoIds));
    }
    if (formIds.length > 0) {
      await db.delete(schema.projectForms).where(inArray(schema.projectForms.id, formIds));
    }
    if (rubricIds.length > 0) {
      await db.delete(schema.projectRubrics).where(inArray(schema.projectRubrics.id, rubricIds));
    }
    if (submissionIds.length > 0) {
      await db.delete(schema.projectFormSubmissions).where(inArray(schema.projectFormSubmissions.id, submissionIds));
    }
    if (formShareIds.length > 0) {
      await db.delete(schema.projectFormShares).where(inArray(schema.projectFormShares.id, formShareIds));
    }

    await db.delete(schema.projectEvaluators).where(eq(schema.projectEvaluators.projectId, projectId));
    await db.delete(schema.projects).where(eq(schema.projects.id, projectId));

    return json({ success: true, message: "Project and all related data deleted" }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId} DELETE error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

async function getProjectForAdmin(db: any, user: any, projectId: number) {
  const projects = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.organizationId, user.organizationId)));
  return projects[0] || null;
}

async function getProjectOverviewData(db: any, projectId: number) {
  const rubrics = await db
    .select()
    .from(schema.projectRubrics)
    .where(eq(schema.projectRubrics.projectId, projectId));
  rubrics.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const formRows = await db
    .select()
    .from(schema.projectForms)
    .where(eq(schema.projectForms.projectId, projectId));
  const projectForm = formRows[0] || null;

  const projectEvaluators = await db
    .select()
    .from(schema.projectEvaluators)
    .where(eq(schema.projectEvaluators.projectId, projectId));

  const videos = await db
    .select()
    .from(schema.projectVideos)
    .where(eq(schema.projectVideos.projectId, projectId));

  return { rubrics, projectForm, projectEvaluators, videos };
}

async function getProjectSubmissionAttachmentVideos(db: any, projectId: number) {
  const submissions = await db
    .select()
    .from(schema.projectFormSubmissions)
    .where(eq(schema.projectFormSubmissions.projectId, projectId));
  if (submissions.length === 0) return [];

  const submissionIds = submissions.map((submission: any) => submission.id);
  const attachments = await db
    .select()
    .from(schema.projectFormSubmissionAttachments)
    .where(
      and(
        eq(schema.projectFormSubmissionAttachments.attachmentType, "video"),
        inArray(schema.projectFormSubmissionAttachments.submissionId, submissionIds)
      )
    );

  return attachments;
}

async function getEvaluatorForUserInOrg(db: any, user: any) {
  if (user.organizationId) {
    const byUserIdInOrg = await db
      .select()
      .from(schema.evaluators)
      .where(
        and(
          eq(schema.evaluators.organizationId, user.organizationId),
          eq(schema.evaluators.userId, user.id)
        )
      );
    if (byUserIdInOrg.length > 0) return byUserIdInOrg[0];

    const byEmailInOrg = await db
      .select()
      .from(schema.evaluators)
      .where(
        and(
          eq(schema.evaluators.organizationId, user.organizationId),
          eq(schema.evaluators.email, user.email)
        )
      );
    if (byEmailInOrg.length > 0) return byEmailInOrg[0];
  }

  const byEmail = await db
    .select()
    .from(schema.evaluators)
    .where(eq(schema.evaluators.email, user.email));
  if (byEmail.length > 0) return byEmail[0];

  return null;
}

function parseAttachmentTypes(raw: unknown): AttachmentType[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is AttachmentType =>
    typeof value === "string" && (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(value)
  );
}

function fileToAttachmentType(file: File): AttachmentType | null {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  if (type.startsWith("image/")) return "images";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type === "application/zip" ||
    type === "application/x-zip-compressed" ||
    name.endsWith(".zip")
  ) {
    return "zip";
  }
  return null;
}

function normalizeProjectFormFields(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((field) => {
      const label = typeof field?.label === "string" ? field.label.trim() : "";
      const type = typeof field?.type === "string" ? field.type.trim() : "text";
      const required = Boolean(field?.required);
      const attachmentTypes = type === "attachment" ? parseAttachmentTypes(field?.attachmentTypes) : [];
      return {
        label,
        type,
        required,
        ...(type === "attachment" ? { attachmentTypes } : {}),
      };
    })
    .filter((field) => field.label);
}

function isMandatoryVideoField(field: any) {
  if (!field || field.type !== "attachment" || !field.required) return false;
  const allowedTypes = parseAttachmentTypes(field.attachmentTypes);
  return allowedTypes.includes("video");
}

export async function handleProjectOverview(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) {
      return json({ error: "Project not found" }, 404, corsHeaders);
    }

    const { rubrics, projectForm, projectEvaluators } = await getProjectOverviewData(db, projectId);
    const submissionVideos = await getProjectSubmissionAttachmentVideos(db, projectId);
    const evaluatorIds = projectEvaluators.map((row: any) => row.evaluatorId);

    const evaluatorRows = evaluatorIds.length
      ? await db.select().from(schema.evaluators).where(inArray(schema.evaluators.id, evaluatorIds))
      : [];
    const evaluators = await enrichEvaluatorsWithProfileName(db, evaluatorRows);

    const totalVideos = submissionVideos.length;
    const videosEvaluated = submissionVideos.filter(
      (video: any) => video.reviewStatus === "reviewed"
    ).length;
    const pendingReviews = submissionVideos.filter(
      (video: any) => video.reviewStatus !== "reviewed"
    ).length;

    let parsedFields: any[] = [];
    if (projectForm?.fieldsJson) {
      try {
        parsedFields = normalizeProjectFormFields(JSON.parse(projectForm.fieldsJson));
      } catch {
        parsedFields = [];
      }
    }

    const workerOrigin = new URL(req.url).origin;
    const videos = submissionVideos
      .slice()
      .sort((a: any, b: any) => b.id - a.id)
      .map((video: any) => ({
        id: video.id,
        title: video.fileName,
        status: video.reviewStatus || "unassigned",
        playbackUrl: `${workerOrigin}/api/projects/${projectId}/videos/${video.id}/stream`,
      }));

    return json(
      {
        project,
        metrics: {
          totalVideos,
          evaluatorsAssigned: evaluators.length,
          pendingReviews,
          videosEvaluated,
        },
        rubrics,
        formFields: parsedFields,
        videosPreview: videos.slice(0, 6),
        evaluators,
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/overview error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectVideos(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const workerOrigin = new URL(req.url).origin;
    const attachments = await getProjectSubmissionAttachmentVideos(db, projectId);
    const videos = attachments
      .slice()
      .sort((a: any, b: any) => b.id - a.id)
      .map((attachment: any) => ({
        id: attachment.id,
        title: attachment.fileName,
        status: attachment.reviewStatus || "unassigned",
        assignedEvaluatorId: attachment.assignedEvaluatorId || null,
        playbackUrl: `${workerOrigin}/api/projects/${projectId}/videos/${attachment.id}/stream`,
      }));
    return json({ videos }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectVideoStream(
  req: Request,
  env: Env,
  db: any,
  projectId: number,
  attachmentId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    let project: any = null;
    if (user.role === "admin" && user.organizationId) {
      project = await getProjectForAdmin(db, user, projectId);
    } else {
      const evaluator = await getEvaluatorForUserInOrg(db, user);
      if (!evaluator) return json({ error: "Unauthorized" }, 403, corsHeaders);
      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.id, projectId),
            eq(schema.projects.organizationId, evaluator.organizationId)
          )
        );
      project = projects[0] || null;
    }
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const attachmentRows = await db
      .select()
      .from(schema.projectFormSubmissionAttachments)
      .where(
        and(
          eq(schema.projectFormSubmissionAttachments.id, attachmentId),
          eq(schema.projectFormSubmissionAttachments.attachmentType, "video")
        )
      );
    const attachment = attachmentRows[0];
    if (!attachment) return json({ error: "Video not found" }, 404, corsHeaders);

    const submissionRows = await db
      .select()
      .from(schema.projectFormSubmissions)
      .where(eq(schema.projectFormSubmissions.id, attachment.submissionId));
    const submission = submissionRows[0];
    if (!submission || submission.projectId !== projectId) {
      return json({ error: "Video not found in project" }, 404, corsHeaders);
    }

    if (user.role !== "admin") {
      const evaluator = await getEvaluatorForUserInOrg(db, user);
      if (!evaluator || attachment.assignedEvaluatorId !== evaluator.id) {
        return json({ error: "Unauthorized to access this video" }, 403, corsHeaders);
      }
    }

    const objectHead = await env.BUCKET.head(attachment.r2Key);
    if (!objectHead) return json({ error: "Stored video not found" }, 404, corsHeaders);

    const rangeHeader = req.headers.get("range");
    const contentType = attachment.mimeType || "video/mp4";

    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const [startStrRaw, endStrRaw] = rangeHeader.replace("bytes=", "").split("-");
      const start = Number.parseInt(startStrRaw || "0", 10);
      const end = endStrRaw ? Number.parseInt(endStrRaw, 10) : objectHead.size - 1;
      const normalizedStart = Number.isFinite(start) && start >= 0 ? start : 0;
      const safeMaxEnd = objectHead.size > 0 ? objectHead.size - 1 : 0;
      const normalizedEndRaw =
        Number.isFinite(end) && end >= normalizedStart ? end : safeMaxEnd;
      const normalizedEnd = Math.min(normalizedEndRaw, safeMaxEnd);
      const length = normalizedEnd - normalizedStart + 1;

      const object = await env.BUCKET.get(attachment.r2Key, {
        range: { offset: normalizedStart, length },
      });
      if (!object) return json({ error: "Stored video not found" }, 404, corsHeaders);

      return new Response(object.body, {
        status: 206,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${normalizedStart}-${normalizedEnd}/${objectHead.size}`,
          "Content-Length": String(length),
        },
      });
    }

    const object = await env.BUCKET.get(attachment.r2Key);
    if (!object) return json({ error: "Stored video not found" }, 404, corsHeaders);

    return new Response(object.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Content-Length": String(objectHead.size),
      },
    });
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/videos/${attachmentId}/stream error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectRubrics(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    if (req.method === "GET") {
      const rubrics = await db
        .select()
        .from(schema.projectRubrics)
        .where(eq(schema.projectRubrics.projectId, projectId));
      rubrics.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return json({ rubrics }, 200, corsHeaders);
    }

    const body = await req.json();
    const incomingRubrics = Array.isArray(body.rubrics) ? body.rubrics : [];
    const normalizedRubrics = incomingRubrics
      .map((rubric: any, index: number) => {
        const title = typeof rubric.title === "string" ? rubric.title.trim() : "";
        const description = typeof rubric.description === "string" ? rubric.description.trim() : null;
        const weightValue = Number.isFinite(Number(rubric.weight)) ? Number(rubric.weight) : 0;
        const weight = Math.max(0, Math.min(100, Math.round(weightValue)));
        return {
          title,
          description,
          weight,
          sortOrder: index,
        };
      })
      .filter((rubric: any) => rubric.title);

    if (normalizedRubrics.length === 0) {
      return json({ error: "Add at least one rubric." }, 400, corsHeaders);
    }

    const totalWeight = normalizedRubrics.reduce((sum: number, rubric: any) => sum + rubric.weight, 0);
    if (totalWeight !== 100) {
      return json({ error: `Total rubric weight must equal 100. Current total: ${totalWeight}.` }, 400, corsHeaders);
    }

    await db.delete(schema.projectRubrics).where(eq(schema.projectRubrics.projectId, projectId));
    for (let i = 0; i < normalizedRubrics.length; i += 1) {
      const rubric = normalizedRubrics[i];
      await db.insert(schema.projectRubrics).values({
        projectId,
        title: rubric.title,
        description: rubric.description,
        weight: rubric.weight,
        sortOrder: rubric.sortOrder,
      });
    }

    const updated = await db
      .select()
      .from(schema.projectRubrics)
      .where(eq(schema.projectRubrics.projectId, projectId));
    updated.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return json({ rubrics: updated }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/rubrics error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleUpdateProjectRubric(req: Request, env: Env, db: any, projectId: number, rubricId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    // Verify rubric belongs to this project
    const existingRubrics = await db
      .select()
      .from(schema.projectRubrics)
      .where(and(eq(schema.projectRubrics.projectId, projectId), eq(schema.projectRubrics.id, rubricId)));
    if (existingRubrics.length === 0) {
      return json({ error: "Rubric not found" }, 404, corsHeaders);
    }
    const existing = existingRubrics[0];

    const body = await req.json();
    const { title, description, weight } = body;

    const updates: Record<string, unknown> = {};
    if (typeof title === "string") {
      const trimmed = title.trim();
      if (!trimmed) return json({ error: "Title cannot be empty" }, 400, corsHeaders);
      updates.title = trimmed;
    }
    if (typeof description === "string") {
      updates.description = description.trim() || null;
    }

    // Weight update: must maintain 100% total across ALL rubrics
    if (typeof weight === "number" && Number.isFinite(weight)) {
      const otherRubricsTotal = (await db
        .select()
        .from(schema.projectRubrics)
        .where(and(eq(schema.projectRubrics.projectId, projectId), eq(schema.projectRubrics.id, rubricId)))
      ).reduce((sum: number, r: any) => sum + (r.weight || 0), 0) - (existing.weight || 0);

      const newTotal = otherRubricsTotal + weight;
      if (newTotal !== 100) {
        return json(
          {
            error: `Changing this weight to ${weight} would make total ${newTotal}%, not 100%. Adjust other rubrics first so their total (excluding this one) is ${100 - weight}.`,
          },
          400,
          corsHeaders
        );
      }
      updates.weight = Math.max(0, Math.min(100, Math.round(weight)));
    }

    if (Object.keys(updates).length === 0) {
      return json({ error: "No valid fields to update" }, 400, corsHeaders);
    }

    await db
      .update(schema.projectRubrics)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(schema.projectRubrics.id, rubricId));

    const updatedRows = await db
      .select()
      .from(schema.projectRubrics)
      .where(and(eq(schema.projectRubrics.projectId, projectId), eq(schema.projectRubrics.id, rubricId)));
    updatedRows.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return json({ rubric: updatedRows[0] }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/rubrics/${rubricId} PATCH error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleDeleteProjectRubric(req: Request, env: Env, db: any, projectId: number, rubricId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const existingRubrics = await db
      .select()
      .from(schema.projectRubrics)
      .where(and(eq(schema.projectRubrics.projectId, projectId), eq(schema.projectRubrics.id, rubricId)));
    if (existingRubrics.length === 0) {
      return json({ error: "Rubric not found" }, 404, corsHeaders);
    }

    // Prevent deleting the last rubric
    const allRubrics = await db
      .select()
      .from(schema.projectRubrics)
      .where(eq(schema.projectRubrics.projectId, projectId));
    if (allRubrics.length <= 1) {
      return json({ error: "Cannot delete the last rubric. Add another rubric first." }, 400, corsHeaders);
    }

    await db.delete(schema.projectRubrics).where(eq(schema.projectRubrics.id, rubricId));

    return json({ success: true, message: "Rubric deleted." }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/rubrics/${rubricId} DELETE error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectForm(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    if (req.method === "GET") {
      const formRows = await db
        .select()
        .from(schema.projectForms)
        .where(eq(schema.projectForms.projectId, projectId));
      const record = formRows[0];
      let fields: any[] = [];
      if (record?.fieldsJson) {
        try {
          fields = normalizeProjectFormFields(JSON.parse(record.fieldsJson));
        } catch {
          fields = [];
        }
      }
      return json({ fields }, 200, corsHeaders);
    }

    const body = await req.json();
    const fields = normalizeProjectFormFields(body.fields);
    if (!fields.some((field: any) => isMandatoryVideoField(field))) {
      return json(
        { error: "Form must include at least one required attachment field that accepts video." },
        400,
        corsHeaders
      );
    }
    const fieldsJson = JSON.stringify(fields);

    const existing = await db
      .select()
      .from(schema.projectForms)
      .where(eq(schema.projectForms.projectId, projectId));

    if (existing.length > 0) {
      await db
        .update(schema.projectForms)
        .set({ fieldsJson })
        .where(eq(schema.projectForms.projectId, projectId));
    } else {
      await db.insert(schema.projectForms).values({ projectId, fieldsJson });
    }

    return json({ fields }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/form error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

async function getProjectForm(db: any, projectId: number) {
  const rows = await db
    .select()
    .from(schema.projectForms)
    .where(eq(schema.projectForms.projectId, projectId));
  return rows[0] || null;
}

async function saveProjectFormFields(db: any, projectId: number, fields: any[]) {
  const fieldsJson = JSON.stringify(fields);
  const existing = await getProjectForm(db, projectId);
  if (existing) {
    await db
      .update(schema.projectForms)
      .set({ fieldsJson })
      .where(eq(schema.projectForms.projectId, projectId));
  } else {
    await db.insert(schema.projectForms).values({ projectId, fieldsJson });
  }
}

export async function handleProjectFormField(req: Request, env: Env, db: any, projectId: number, fieldIndex: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const record = await getProjectForm(db, projectId);
    let fields: any[] = record?.fieldsJson ? normalizeProjectFormFields(JSON.parse(record.fieldsJson)) : [];
    if (fields.length === 0) {
      return json({ error: "Form has no fields." }, 400, corsHeaders);
    }

    if (fieldIndex < 0 || fieldIndex >= fields.length) {
      return json({ error: "Field index out of range." }, 400, corsHeaders);
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const { label, type, required, attachmentTypes } = body;

      if (typeof label === "string") {
        const trimmed = label.trim();
        if (!trimmed) return json({ error: "Field label cannot be empty." }, 400, corsHeaders);
        fields[fieldIndex].label = trimmed;
      }
      if (typeof type === "string") {
        const validTypes = ["text", "textarea", "number", "date", "attachment"];
        if (!validTypes.includes(type)) {
          return json({ error: `Invalid field type. Must be one of: ${validTypes.join(", ")}` }, 400, corsHeaders);
        }
        fields[fieldIndex].type = type;
        if (type !== "attachment") {
          delete fields[fieldIndex].attachmentTypes;
        } else {
          fields[fieldIndex].attachmentTypes = Array.isArray(attachmentTypes) ? attachmentTypes : [];
        }
      }
      if (typeof required === "boolean") {
        fields[fieldIndex].required = required;
      }
      if (Array.isArray(attachmentTypes)) {
        fields[fieldIndex].attachmentTypes = attachmentTypes;
      }

      await saveProjectFormFields(db, projectId, fields);
      return json({ fields }, 200, corsHeaders);
    }

    if (req.method === "DELETE") {
      const isMandatoryVideo = isMandatoryVideoField(fields[fieldIndex]);
      if (isMandatoryVideo) {
        return json(
          { error: "Cannot delete the mandatory video submission field." },
          400,
          corsHeaders
        );
      }
      fields.splice(fieldIndex, 1);
      await saveProjectFormFields(db, projectId, fields);
      return json({ fields }, 200, corsHeaders);
    }

    return json({ error: "Method not allowed." }, 405, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/form/fields/${fieldIndex} error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAddProjectFormField(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const body = await req.json();
    const { label, type, required, attachmentTypes } = body;

    const newField: Record<string, unknown> = {
      label: typeof label === "string" && label.trim() ? label.trim() : "New Field",
      type: ["text", "textarea", "number", "date", "attachment"].includes(type) ? type : "text",
      required: Boolean(required),
    };
    if (newField.type === "attachment") {
      newField.attachmentTypes = Array.isArray(attachmentTypes) ? attachmentTypes : [];
    }

    const record = await getProjectForm(db, projectId);
    let fields: any[] = record?.fieldsJson ? normalizeProjectFormFields(JSON.parse(record.fieldsJson)) : [];
    fields.push(newField);

    await saveProjectFormFields(db, projectId, fields);
    return json({ fields }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/form/fields POST error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectFormTestSubmit(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const formRows = await db
      .select()
      .from(schema.projectForms)
      .where(eq(schema.projectForms.projectId, projectId));
    const formConfig = formRows[0];
    const formFields = formConfig?.fieldsJson
      ? normalizeProjectFormFields(JSON.parse(formConfig.fieldsJson))
      : [];
    if (!formFields.some((field: any) => isMandatoryVideoField(field))) {
      return json(
        { error: "Project form is missing a mandatory video field. Update the form first." },
        400,
        corsHeaders
      );
    }

    const formData = await req.formData();
    const fieldsPayloadRaw = formData.get("fields");
    let fieldsPayload: Record<string, unknown> = {};
    if (typeof fieldsPayloadRaw === "string" && fieldsPayloadRaw.trim()) {
      try {
        fieldsPayload = JSON.parse(fieldsPayloadRaw);
      } catch {
        fieldsPayload = {};
      }
    }

    const attachmentFields = formFields
      .map((field: any, index: number) => ({ ...field, index }))
      .filter((field: any) => field.type === "attachment");
    const mandatoryVideoFieldIndexes = new Set(
      attachmentFields
        .filter((field: any) => isMandatoryVideoField(field))
        .map((field: any) => field.index)
    );

    const attachmentUploadPlan: Array<{
      formFieldKey: string;
      file: File;
      detectedType: AttachmentType;
    }> = [];

    for (const field of attachmentFields) {
      const formFieldKey = `attachment_${field.index}`;
      const files = formData.getAll(formFieldKey).filter((entry) => entry instanceof File) as File[];

      if (field.required && files.length === 0) {
        return json({ error: `Attachment required for field '${field.label}'.` }, 400, corsHeaders);
      }

      let hasVideoFileInField = false;

      for (const file of files) {
        if (!file.name || file.size === 0) continue;

        const detectedType = fileToAttachmentType(file);
        if (!detectedType) {
          return json({ error: `Unsupported attachment type for file ${file.name}` }, 400, corsHeaders);
        }
        const allowedTypes = parseAttachmentTypes(field.attachmentTypes);
        if (allowedTypes.length > 0 && !allowedTypes.includes(detectedType)) {
          return json(
            { error: `Attachment type '${detectedType}' is not allowed for field '${field.label}'.` },
            400,
            corsHeaders
          );
        }
        if (detectedType === "video") hasVideoFileInField = true;

        attachmentUploadPlan.push({
          formFieldKey,
          file,
          detectedType,
        });
      }

      if (mandatoryVideoFieldIndexes.has(field.index) && !hasVideoFileInField) {
        return json(
          { error: `Field '${field.label}' requires at least one video file.` },
          400,
          corsHeaders
        );
      }
    }

    const [submission] = await db
      .insert(schema.projectFormSubmissions)
      .values({
        projectId,
        submitterUserId: user.id,
        fieldsJson: JSON.stringify(fieldsPayload),
      })
      .returning();

    let attachmentCount = 0;
    for (const item of attachmentUploadPlan) {
      const key = `project-form-submissions/${projectId}/${submission.id}/${crypto.randomUUID()}-${item.file.name}`;
      const buffer = await item.file.arrayBuffer();
      await env.BUCKET.put(key, buffer, {
        httpMetadata: {
          contentType: item.file.type || undefined,
        },
      });

      await db.insert(schema.projectFormSubmissionAttachments).values({
        submissionId: submission.id,
        formFieldKey: item.formFieldKey,
        r2Key: key,
        fileName: item.file.name,
        fileSize: item.file.size,
        mimeType: item.file.type || "application/octet-stream",
        attachmentType: item.detectedType,
        assignedEvaluatorId: null,
        reviewStatus: "unassigned",
      });
      attachmentCount += 1;
    }

    return json(
      { success: true, submissionId: submission.id, attachmentsStored: attachmentCount },
      201,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/form/test-submit error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleOrganizationEvaluators(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const evaluatorRows = await db
      .select()
      .from(schema.evaluators)
      .where(eq(schema.evaluators.organizationId, user.organizationId));
    const evaluators = await enrichEvaluatorsWithProfileName(db, evaluatorRows);

    return json({ evaluators }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAssignProjectEvaluator(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const body = await req.json();
    const mode = body.mode === "existing" ? "existing" : "new";
    let evaluatorId: number | null = null;

    if (mode === "existing") {
      const existingEvaluatorId = Number(body.evaluatorId);
      if (!existingEvaluatorId) {
        return json({ error: "evaluatorId is required" }, 400, corsHeaders);
      }
      const evaluatorRows = await db
        .select()
        .from(schema.evaluators)
        .where(and(eq(schema.evaluators.id, existingEvaluatorId), eq(schema.evaluators.organizationId, user.organizationId)));
      if (evaluatorRows.length === 0) {
        return json({ error: "Evaluator not found" }, 404, corsHeaders);
      }
      evaluatorId = evaluatorRows[0].id;
    } else {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const name = typeof body.name === "string" ? body.name.trim() : null;
      if (!email) {
        return json({ error: "Evaluator email is required" }, 400, corsHeaders);
      }

      const existingByEmail = await db
        .select()
        .from(schema.evaluators)
        .where(and(eq(schema.evaluators.organizationId, user.organizationId), eq(schema.evaluators.email, email)));
      if (existingByEmail.length > 0) {
        evaluatorId = existingByEmail[0].id;
      } else {
        const matchedUsers = await db
          .select()
          .from(schema.users)
          .where(and(eq(schema.users.email, email), eq(schema.users.organizationId, user.organizationId)));
        const matchedUser = matchedUsers[0];

        const [createdEvaluator] = await db
          .insert(schema.evaluators)
          .values({
            organizationId: user.organizationId,
            userId: matchedUser?.id || null,
            email,
            name: name || matchedUser?.name || null,
            createdBy: user.id,
          })
          .returning();
        evaluatorId = createdEvaluator.id;
      }
    }

    const existingAssignment = await db
      .select()
      .from(schema.projectEvaluators)
      .where(and(eq(schema.projectEvaluators.projectId, projectId), eq(schema.projectEvaluators.evaluatorId, evaluatorId)));
    if (existingAssignment.length === 0) {
      await db.insert(schema.projectEvaluators).values({ projectId, evaluatorId });
    }

    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error(`/api/projects/${projectId}/evaluators/assign error:`, e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAdminVideosGrouped(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const projects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.organizationId, user.organizationId));

    const workerOrigin = new URL(req.url).origin;
    const grouped = await Promise.all(
      projects.map(async (project: any) => {
        const attachments = await getProjectSubmissionAttachmentVideos(db, project.id);
        const videos = attachments
          .slice()
          .sort((a: any, b: any) => b.id - a.id)
          .map((attachment: any) => ({
            id: attachment.id,
            title: attachment.fileName,
            status: attachment.reviewStatus || "unassigned",
            playbackUrl: `${workerOrigin}/api/projects/${project.id}/videos/${attachment.id}/stream`,
          }));

        return {
          project: {
            id: project.id,
            name: project.name,
          },
          summary: {
            totalVideos: videos.length,
          },
          videos,
        };
      })
    );

    return json({ groups: grouped }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/admin/videos error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAdminEvaluatorsGrouped(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const projects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.organizationId, user.organizationId));

    const grouped = await Promise.all(
      projects.map(async (project: any) => {
        const assignments = await db
          .select()
          .from(schema.projectEvaluators)
          .where(eq(schema.projectEvaluators.projectId, project.id));
        const evaluatorIds = assignments.map((assignment: any) => assignment.evaluatorId);

        const evaluatorRows = evaluatorIds.length
          ? await db
              .select()
              .from(schema.evaluators)
              .where(inArray(schema.evaluators.id, evaluatorIds))
          : [];
        const evaluators = await enrichEvaluatorsWithProfileName(db, evaluatorRows);

        return {
          project: {
            id: project.id,
            name: project.name,
          },
          summary: {
            totalEvaluators: evaluators.length,
          },
          evaluators,
        };
      })
    );

    return json({ groups: grouped }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    console.error("/api/admin/evaluators error:", e);
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleProjectVideoAssignmentContext(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const assignments = await db
      .select()
      .from(schema.projectEvaluators)
      .where(eq(schema.projectEvaluators.projectId, projectId));
    const evaluatorIds = assignments.map((a: any) => a.evaluatorId);
    const evaluatorRows = evaluatorIds.length
      ? await db.select().from(schema.evaluators).where(inArray(schema.evaluators.id, evaluatorIds))
      : [];
    const evaluators = await enrichEvaluatorsWithProfileName(db, evaluatorRows);

    const videos = await getProjectSubmissionAttachmentVideos(db, projectId);

    // Count how many videos are currently assigned to each evaluator
    const assignedCountByEvaluatorId = new Map<number, number>();
    for (const video of videos) {
      if (video.assignedEvaluatorId) {
        assignedCountByEvaluatorId.set(
          video.assignedEvaluatorId,
          (assignedCountByEvaluatorId.get(video.assignedEvaluatorId) || 0) + 1
        );
      }
    }

    // Attach current assignment count to each evaluator so the UI can show it
    const evaluatorsWithCounts = evaluators.map((ev: any) => ({
      ...ev,
      assignedCount: assignedCountByEvaluatorId.get(ev.id) || 0,
    }));
    const unassignedVideos = videos.filter(
      (video: any) => !video.assignedEvaluatorId && (video.reviewStatus || "unassigned") === "unassigned"
    );

    return json(
      {
        project: { id: project.id, name: project.name },
        totalVideos: videos.length,
        unassignedVideos: unassignedVideos.length,
        evaluators: evaluatorsWithCounts,
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

function shuffle<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function handleAssignProjectVideos(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const body = await req.json();
    const allocations = Array.isArray(body.allocations) ? body.allocations : [];

    const assignmentRows = await db
      .select()
      .from(schema.projectEvaluators)
      .where(eq(schema.projectEvaluators.projectId, projectId));
    const validEvaluatorIds = new Set(assignmentRows.map((row: any) => row.evaluatorId));

    const normalized = allocations
      .map((allocation: any) => ({
        evaluatorId: Number(allocation.evaluatorId),
        additionalCount: Math.max(0, Math.floor(Number(allocation.additionalCount) || 0)),
      }))
      .filter((allocation: any) => Number.isFinite(allocation.evaluatorId) && allocation.additionalCount > 0);

    const requestedTotal = normalized.reduce((sum, a) => sum + a.additionalCount, 0);

    for (const allocation of normalized) {
      if (!validEvaluatorIds.has(allocation.evaluatorId)) {
        return json({ error: `Evaluator ${allocation.evaluatorId} is not assigned to this project` }, 400, corsHeaders);
      }
    }

    const videos = await getProjectSubmissionAttachmentVideos(db, projectId);
    const unassigned = videos.filter(
      (video: any) => !video.assignedEvaluatorId && (video.reviewStatus || "unassigned") === "unassigned"
    );
    if (requestedTotal > unassigned.length) {
      return json(
        { error: `Requested ${requestedTotal} videos but only ${unassigned.length} are unassigned.` },
        400,
        corsHeaders
      );
    }

    const randomized = shuffle(unassigned);
    let cursor = 0;
    for (const allocation of normalized) {
      for (let i = 0; i < allocation.additionalCount; i += 1) {
        const video = randomized[cursor];
        if (!video) break;
        cursor += 1;
        await db
          .update(schema.projectFormSubmissionAttachments)
          .set({
            assignedEvaluatorId: allocation.evaluatorId,
            reviewStatus: "assigned",
          })
          .where(eq(schema.projectFormSubmissionAttachments.id, video.id));
      }
    }

    return json({ success: true, assignedVideos: cursor }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleUnassignVideos(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const body = await req.json();
    const { evaluatorId, count } = body;
    const unassignCount = Math.max(0, Math.floor(Number(count) || 0));

    if (!Number.isFinite(Number(evaluatorId)) || unassignCount === 0) {
      return json({ error: "evaluatorId and a positive count are required" }, 400, corsHeaders);
    }

    // Find videos assigned to this evaluator that haven't been reviewed yet
    const videos = await getProjectSubmissionAttachmentVideos(db, projectId);
    const toUnassign = videos.filter(
      (v: any) => v.assignedEvaluatorId === evaluatorId && v.reviewStatus !== "reviewed"
    );

    if (toUnassign.length === 0) {
      return json({ success: true, unassignedVideos: 0 }, 200, corsHeaders);
    }

    const toUnassignIds = toUnassign.slice(0, unassignCount).map((v: any) => v.id);
    await db
      .update(schema.projectFormSubmissionAttachments)
      .set({ assignedEvaluatorId: null, reviewStatus: "unassigned", reviewedAt: null })
      .where(inArray(schema.projectFormSubmissionAttachments.id, toUnassignIds));

    return json({ success: true, unassignedVideos: toUnassignIds.length }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleRemoveProjectEvaluator(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const { evaluatorId } = await req.json();
    const evaluatorIdNum = Number(evaluatorId);
    if (!Number.isFinite(evaluatorIdNum)) {
      return json({ error: "evaluatorId is required" }, 400, corsHeaders);
    }

    await db
      .delete(schema.projectEvaluators)
      .where(
        and(
          eq(schema.projectEvaluators.projectId, projectId),
          eq(schema.projectEvaluators.evaluatorId, evaluatorIdNum)
        )
      );

    const videos = await getProjectSubmissionAttachmentVideos(db, projectId);
    for (const video of videos) {
      if (video.assignedEvaluatorId === evaluatorIdNum) {
        await db
          .update(schema.projectFormSubmissionAttachments)
          .set({
            assignedEvaluatorId: null,
            reviewStatus: "unassigned",
            reviewedAt: null,
          })
          .where(eq(schema.projectFormSubmissionAttachments.id, video.id));
      }
    }

    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleEvaluatorProjects(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || (user.role !== "reviewer" && user.role !== "evaluator")) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const evaluator = await getEvaluatorForUserInOrg(db, user);
    if (!evaluator) return json({ error: "Evaluator profile not found for this user." }, 403, corsHeaders);

    const projectEvaluatorRows = await db
      .select()
      .from(schema.projectEvaluators)
      .where(eq(schema.projectEvaluators.evaluatorId, evaluator.id));
    const projectIds = projectEvaluatorRows.map((row: any) => row.projectId);
    if (projectIds.length === 0) return json({ projects: [] }, 200, corsHeaders);

    const projects = await db.select().from(schema.projects).where(inArray(schema.projects.id, projectIds));

    const result = await Promise.all(
      projects.map(async (project: any) => {
        const videos = await getProjectSubmissionAttachmentVideos(db, project.id);
        const assigned = videos.filter((video: any) => video.assignedEvaluatorId === evaluator.id);
        const pending = assigned.filter((video: any) => video.reviewStatus === "assigned").length;
        const reviewed = assigned.filter((video: any) => video.reviewStatus === "reviewed").length;
        return {
          id: project.id,
          name: project.name,
          totalAssignedVideos: assigned.length,
          pendingVideos: pending,
          reviewedVideos: reviewed,
        };
      })
    );

    return json({ projects: result }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleEvaluatorReviewQueue(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || (user.role !== "reviewer" && user.role !== "evaluator")) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const evaluator = await getEvaluatorForUserInOrg(db, user);
    if (!evaluator) return json({ error: "Evaluator profile not found for this user." }, 403, corsHeaders);

    const workerOrigin = new URL(req.url).origin;
    const projectRows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.organizationId, evaluator.organizationId));

    const queueItems: any[] = [];
    for (const project of projectRows) {
      const videos = await getProjectSubmissionAttachmentVideos(db, project.id);
      for (const video of videos) {
        if (video.assignedEvaluatorId === evaluator.id && video.reviewStatus === "assigned") {
          queueItems.push({
            id: video.id,
            projectId: project.id,
            projectName: project.name,
            title: video.fileName,
            status: video.reviewStatus,
            playbackUrl: `${workerOrigin}/api/projects/${project.id}/videos/${video.id}/stream`,
          });
        }
      }
    }

    return json({ queue: queueItems }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

async function getEvaluatorVideoContext(
  db: any,
  user: any,
  videoAttachmentId: number
) {
  const evaluator = await getEvaluatorForUserInOrg(db, user);
  if (!evaluator) return null;

  const attachmentRows = await db
    .select()
    .from(schema.projectFormSubmissionAttachments)
    .where(eq(schema.projectFormSubmissionAttachments.id, videoAttachmentId));
  const attachment = attachmentRows[0];
  if (!attachment || attachment.attachmentType !== "video") return null;
  if (attachment.assignedEvaluatorId !== evaluator.id) return null;

  const submissionRows = await db
    .select()
    .from(schema.projectFormSubmissions)
    .where(eq(schema.projectFormSubmissions.id, attachment.submissionId));
  const submission = submissionRows[0];
  if (!submission) return null;

  const projectRows = await db
    .select()
    .from(schema.projects)
    .where(
      and(
        eq(schema.projects.id, submission.projectId),
        eq(schema.projects.organizationId, evaluator.organizationId)
      )
    );
  const project = projectRows[0];
  if (!project) return null;

  return { evaluator, attachment, submission, project };
}

export async function handleEvaluatorReviewContext(
  req: Request,
  env: Env,
  db: any,
  videoAttachmentId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || (user.role !== "reviewer" && user.role !== "evaluator")) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const ctx = await getEvaluatorVideoContext(db, user, videoAttachmentId);
    if (!ctx) return json({ error: "Video not found in your queue" }, 404, corsHeaders);

    const workerOrigin = new URL(req.url).origin;
    const rubrics = await db
      .select()
      .from(schema.projectRubrics)
      .where(eq(schema.projectRubrics.projectId, ctx.project.id));
    rubrics.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const formRows = await db
      .select()
      .from(schema.projectForms)
      .where(eq(schema.projectForms.projectId, ctx.project.id));
    const form = formRows[0];
    const formFields = form?.fieldsJson
      ? normalizeProjectFormFields(JSON.parse(form.fieldsJson))
      : [];

    let submittedFields: Record<string, any> = {};
    if (ctx.submission.fieldsJson) {
      try {
        submittedFields = JSON.parse(ctx.submission.fieldsJson);
      } catch {
        submittedFields = {};
      }
    }

    const submissionAttachments = await db
      .select()
      .from(schema.projectFormSubmissionAttachments)
      .where(eq(schema.projectFormSubmissionAttachments.submissionId, ctx.submission.id));

    const reviewRows = await db
      .select()
      .from(schema.projectVideoReviews)
      .where(eq(schema.projectVideoReviews.videoAttachmentId, videoAttachmentId));
    const review = reviewRows[0] || null;
    let rubricBreakdown: any[] = [];
    if (review?.rubricBreakdownJson) {
      try {
        rubricBreakdown = JSON.parse(review.rubricBreakdownJson);
      } catch {
        rubricBreakdown = [];
      }
    }

    const videoPlaybackUrl = `${workerOrigin}/api/projects/${ctx.project.id}/videos/${ctx.attachment.id}/stream`;
    const attachmentItems = submissionAttachments
      .filter((attachment: any) => attachment.id !== ctx.attachment.id)
      .map((attachment: any) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        type: attachment.attachmentType,
        formFieldKey: attachment.formFieldKey,
        url: `${workerOrigin}/api/attachments/${attachment.id}/open`,
      }));

    return json(
      {
        video: {
          id: ctx.attachment.id,
          title: ctx.attachment.fileName,
          playbackUrl: videoPlaybackUrl,
        },
        project: {
          id: ctx.project.id,
          name: ctx.project.name,
        },
        rubrics,
        formFields,
        submittedFields,
        attachments: attachmentItems,
        review: {
          rubricBreakdown,
        },
      },
      200,
      corsHeaders
    );
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleSaveEvaluatorReview(
  req: Request,
  env: Env,
  db: any,
  videoAttachmentId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || (user.role !== "reviewer" && user.role !== "evaluator")) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }

    const ctx = await getEvaluatorVideoContext(db, user, videoAttachmentId);
    if (!ctx) return json({ error: "Video not found in your queue" }, 404, corsHeaders);

    const body = await req.json();
    const rubricBreakdown = Array.isArray(body.rubricBreakdown) ? body.rubricBreakdown : [];

    const rubricRows = await db
      .select()
      .from(schema.projectRubrics)
      .where(eq(schema.projectRubrics.projectId, ctx.project.id));
    rubricRows.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (rubricRows.length === 0) {
      return json({ error: "No rubric configured for this project." }, 400, corsHeaders);
    }

    const incomingByRubricId = new Map<number, any>();
    for (const item of rubricBreakdown) {
      const rubricId = Number(item?.rubricId);
      if (!Number.isFinite(rubricId)) continue;
      incomingByRubricId.set(rubricId, item);
    }

    const normalizedRubricBreakdown: any[] = [];
    for (const rubric of rubricRows) {
      const item = incomingByRubricId.get(rubric.id);
      if (!item) {
        return json({ error: `Missing score for rubric '${rubric.title}'.` }, 400, corsHeaders);
      }

      const rating = Number(item.rating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
        return json({ error: `Rubric '${rubric.title}' must be scored between 1 and 10.` }, 400, corsHeaders);
      }

      const note = typeof item.note === "string" ? item.note.trim() : "";
      normalizedRubricBreakdown.push({
        rubricId: rubric.id,
        rating: Math.round(rating),
        note,
      });
    }

    const rubricBreakdownJson = JSON.stringify(normalizedRubricBreakdown);

    const existingReview = await db
      .select()
      .from(schema.projectVideoReviews)
      .where(eq(schema.projectVideoReviews.videoAttachmentId, videoAttachmentId));
    if (existingReview.length > 0) {
      await db
        .update(schema.projectVideoReviews)
        .set({ rubricBreakdownJson })
        .where(eq(schema.projectVideoReviews.videoAttachmentId, videoAttachmentId));
    } else {
      await db.insert(schema.projectVideoReviews).values({
        videoAttachmentId,
        projectId: ctx.project.id,
        evaluatorId: ctx.evaluator.id,
        rubricBreakdownJson,
      });
    }

    await db
      .update(schema.projectFormSubmissionAttachments)
      .set({
        reviewStatus: "reviewed",
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(schema.projectFormSubmissionAttachments.id, videoAttachmentId));

    return json({ success: true }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleOpenAttachment(
  req: Request,
  env: Env,
  db: any,
  attachmentId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) return json({ error: "Unauthorized" }, 403, corsHeaders);

    const attachmentRows = await db
      .select()
      .from(schema.projectFormSubmissionAttachments)
      .where(eq(schema.projectFormSubmissionAttachments.id, attachmentId));
    const attachment = attachmentRows[0];
    if (!attachment) return json({ error: "Attachment not found" }, 404, corsHeaders);

    const submissionRows = await db
      .select()
      .from(schema.projectFormSubmissions)
      .where(eq(schema.projectFormSubmissions.id, attachment.submissionId));
    const submission = submissionRows[0];
    if (!submission) return json({ error: "Attachment not found" }, 404, corsHeaders);

    const projectRows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, submission.projectId));
    const project = projectRows[0];
    if (!project) return json({ error: "Attachment not found" }, 404, corsHeaders);

    if (user.role === "admin") {
      if (!user.organizationId || user.organizationId !== project.organizationId) {
        return json({ error: "Unauthorized" }, 403, corsHeaders);
      }
    } else {
      const evaluator = await getEvaluatorForUserInOrg(db, user);
      if (!evaluator || evaluator.organizationId !== project.organizationId) {
        return json({ error: "Unauthorized" }, 403, corsHeaders);
      }
      if (
        attachment.attachmentType === "video" &&
        attachment.assignedEvaluatorId &&
        attachment.assignedEvaluatorId !== evaluator.id
      ) {
        return json({ error: "Unauthorized" }, 403, corsHeaders);
      }
    }

    const object = await env.BUCKET.get(attachment.r2Key);
    if (!object) return json({ error: "Attachment file not found" }, 404, corsHeaders);

    return new Response(object.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": attachment.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${attachment.fileName}"`,
      },
    });
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

// ─── Submitter-side API handlers ──────────────────────────────────────────────

export async function handleShareFormWithSubmitters(
  req: Request,
  env: Env,
  db: any,
  projectId: number
) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const body = await req.json();
    const emails: string[] = Array.isArray(body.emails)
      ? body.emails.map((e: unknown) => (typeof e === "string" ? e.trim().toLowerCase() : "")).filter(Boolean)
      : [];
    const message = typeof body.message === "string" ? body.message.trim() : null;

    if (emails.length === 0) {
      return json({ error: "At least one email is required." }, 400, corsHeaders);
    }

    const formRows = await db.select().from(schema.projectForms).where(eq(schema.projectForms.projectId, projectId));
    if (formRows.length === 0) {
      return json({ error: "Build a form before sharing." }, 400, corsHeaders);
    }

    const created: number[] = [];
    const alreadyShared: string[] = [];

    for (const email of emails) {
      const existing = await db
        .select()
        .from(schema.projectFormShares)
        .where(and(eq(schema.projectFormShares.projectId, projectId), eq(schema.projectFormShares.submitterEmail, email)));
      if (existing.length > 0) { alreadyShared.push(email); continue; }

      const matchedUsers = await db.select().from(schema.users).where(eq(schema.users.email, email));
      const submitterUserId = matchedUsers[0]?.id ?? null;

      const [share] = await db
        .insert(schema.projectFormShares)
        .values({ projectId, submitterEmail: email, submitterUserId, sharedByUserId: user.id, message })
        .returning();
      created.push(share.id);
    }

    return json({ success: true, created: created.length, alreadyShared }, 201, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleGetFormShares(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user || user.role !== "admin" || !user.organizationId) {
      return json({ error: "Unauthorized" }, 403, corsHeaders);
    }
    const project = await getProjectForAdmin(db, user, projectId);
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const shares = await db.select().from(schema.projectFormShares).where(eq(schema.projectFormShares.projectId, projectId));

    const sharesWithStatus = await Promise.all(
      shares.map(async (share: any) => {
        let submissionId: number | null = null;
        let submittedAt: string | null = null;
        if (share.submitterUserId) {
          const subs = await db
            .select()
            .from(schema.projectFormSubmissions)
            .where(and(eq(schema.projectFormSubmissions.projectId, projectId), eq(schema.projectFormSubmissions.submitterUserId, share.submitterUserId)));
          if (subs.length > 0) { submissionId = subs[0].id; submittedAt = subs[0].submittedAt; }
        }
        return { id: share.id, email: share.submitterEmail, sharedAt: share.sharedAt, message: share.message, submitted: !!submissionId, submissionId, submittedAt };
      })
    );

    return json({ shares: sharesWithStatus }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleSubmitterApplications(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) return json({ error: "Unauthorized" }, 403, corsHeaders);

    const sharesByEmail = await db.select().from(schema.projectFormShares).where(eq(schema.projectFormShares.submitterEmail, user.email));
    const sharesByUserId = user.id
      ? await db.select().from(schema.projectFormShares).where(eq(schema.projectFormShares.submitterUserId, user.id))
      : [];

    const seenProjectIds = new Set<number>();
    const uniqueShares = [...sharesByEmail, ...sharesByUserId].filter((share: any) => {
      if (seenProjectIds.has(share.projectId)) return false;
      seenProjectIds.add(share.projectId);
      return true;
    });

    if (uniqueShares.length === 0) return json({ applications: [] }, 200, corsHeaders);

    const projectIds = uniqueShares.map((s: any) => s.projectId);
    const projects = await db.select().from(schema.projects).where(inArray(schema.projects.id, projectIds));
    const orgIds = [...new Set(projects.map((p: any) => p.organizationId).filter(Boolean))] as number[];
    const orgs = orgIds.length ? await db.select().from(schema.organizations).where(inArray(schema.organizations.id, orgIds)) : [];
    const orgById = new Map(orgs.map((o: any) => [o.id, o]));

    const submissions = await db
      .select()
      .from(schema.projectFormSubmissions)
      .where(and(inArray(schema.projectFormSubmissions.projectId, projectIds), eq(schema.projectFormSubmissions.submitterUserId, user.id)));
    const submissionByProjectId = new Map(submissions.map((s: any) => [s.projectId, s]));

    const applications = await Promise.all(
      uniqueShares.map(async (share: any) => {
        const project = projects.find((p: any) => p.id === share.projectId);
        if (!project) return null;
        const submission = submissionByProjectId.get(project.id) || null;

        let reviewProgress: { total: number; reviewed: number } | null = null;
        if (submission) {
          const attachments = await db
            .select()
            .from(schema.projectFormSubmissionAttachments)
            .where(and(eq(schema.projectFormSubmissionAttachments.submissionId, submission.id), eq(schema.projectFormSubmissionAttachments.attachmentType, "video")));
          const total = attachments.length;
          const reviewed = attachments.filter((a: any) => a.reviewStatus === "reviewed").length;
          reviewProgress = { total, reviewed };
        }

        const org = orgById.get(project.organizationId) || null;
        return {
          shareId: share.id,
          sharedAt: share.sharedAt,
          message: share.message,
          project: { id: project.id, name: project.name, description: project.description, status: project.status },
          organization: org ? { id: org.id, name: org.name } : null,
          submission: submission ? { id: submission.id, submittedAt: submission.submittedAt, reviewProgress } : null,
        };
      })
    );

    return json({ applications: applications.filter(Boolean) }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleSubmitterGetForm(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) return json({ error: "Unauthorized" }, 403, corsHeaders);

    const shares = await db.select().from(schema.projectFormShares).where(and(eq(schema.projectFormShares.projectId, projectId), eq(schema.projectFormShares.submitterEmail, user.email)));
    const sharesByUserId = user.id
      ? await db.select().from(schema.projectFormShares).where(and(eq(schema.projectFormShares.projectId, projectId), eq(schema.projectFormShares.submitterUserId, user.id)))
      : [];

    if (shares.length === 0 && sharesByUserId.length === 0) {
      const projectRows = await db.select().from(schema.projects).where(and(eq(schema.projects.id, projectId), eq(schema.projects.status, "active")));
      if (projectRows.length === 0) return json({ error: "Not invited to this project" }, 403, corsHeaders);
    }

    const projectRows = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
    const project = projectRows[0];
    if (!project) return json({ error: "Project not found" }, 404, corsHeaders);

    const formRows = await db.select().from(schema.projectForms).where(eq(schema.projectForms.projectId, projectId));
    const form = formRows[0];
    if (!form) return json({ error: "No form configured for this project" }, 404, corsHeaders);

    let fields: any[] = [];
    try { fields = normalizeProjectFormFields(JSON.parse(form.fieldsJson)); } catch { fields = []; }

    const existingSubmissions = await db.select().from(schema.projectFormSubmissions).where(and(eq(schema.projectFormSubmissions.projectId, projectId), eq(schema.projectFormSubmissions.submitterUserId, user.id)));
    const existingSubmission = existingSubmissions[0] || null;

    const orgRows = await db.select().from(schema.organizations).where(eq(schema.organizations.id, project.organizationId));
    const org = orgRows[0] || null;

    return json({
      project: { id: project.id, name: project.name, description: project.description, status: project.status },
      organization: org ? { id: org.id, name: org.name } : null,
      fields,
      existingSubmission: existingSubmission ? { id: existingSubmission.id, submittedAt: existingSubmission.submittedAt } : null,
    }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleSubmitterSubmitForm(req: Request, env: Env, db: any, projectId: number) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) return json({ error: "Unauthorized" }, 403, corsHeaders);

    const shares = await db.select().from(schema.projectFormShares).where(and(eq(schema.projectFormShares.projectId, projectId), eq(schema.projectFormShares.submitterEmail, user.email)));
    const sharesByUserId = user.id ? await db.select().from(schema.projectFormShares).where(and(eq(schema.projectFormShares.projectId, projectId), eq(schema.projectFormShares.submitterUserId, user.id))) : [];
    const hasShare = shares.length > 0 || sharesByUserId.length > 0;
    if (!hasShare) {
      const projectRows = await db.select().from(schema.projects).where(and(eq(schema.projects.id, projectId), eq(schema.projects.status, "active")));
      if (projectRows.length === 0) return json({ error: "Not authorized to submit" }, 403, corsHeaders);
    }

    const existing = await db.select().from(schema.projectFormSubmissions).where(and(eq(schema.projectFormSubmissions.projectId, projectId), eq(schema.projectFormSubmissions.submitterUserId, user.id)));
    if (existing.length > 0) return json({ error: "You have already submitted for this project." }, 409, corsHeaders);

    const formRows = await db.select().from(schema.projectForms).where(eq(schema.projectForms.projectId, projectId));
    const formConfig = formRows[0];
    const formFields = formConfig?.fieldsJson ? normalizeProjectFormFields(JSON.parse(formConfig.fieldsJson)) : [];
    if (!formFields.some((field: any) => isMandatoryVideoField(field))) {
      return json({ error: "Project form is not configured correctly." }, 400, corsHeaders);
    }

    const formData = await req.formData();
    const fieldsPayloadRaw = formData.get("fields");
    let fieldsPayload: Record<string, unknown> = {};
    if (typeof fieldsPayloadRaw === "string" && fieldsPayloadRaw.trim()) {
      try { fieldsPayload = JSON.parse(fieldsPayloadRaw); } catch { fieldsPayload = {}; }
    }

    const attachmentFields = formFields.map((field: any, index: number) => ({ ...field, index })).filter((field: any) => field.type === "attachment");
    const mandatoryVideoFieldIndexes = new Set(attachmentFields.filter((field: any) => isMandatoryVideoField(field)).map((field: any) => field.index));
    const attachmentUploadPlan: Array<{ formFieldKey: string; file: File; detectedType: AttachmentType }> = [];

    for (const field of attachmentFields) {
      const formFieldKey = `attachment_${field.index}`;
      const files = formData.getAll(formFieldKey).filter((entry) => entry instanceof File) as File[];
      if (field.required && files.length === 0) return json({ error: `Attachment required for '${field.label}'.` }, 400, corsHeaders);
      let hasVideoInField = false;
      for (const file of files) {
        if (!file.name || file.size === 0) continue;
        const detectedType = fileToAttachmentType(file);
        if (!detectedType) return json({ error: `Unsupported file type for ${file.name}` }, 400, corsHeaders);
        const allowedTypes = parseAttachmentTypes(field.attachmentTypes);
        if (allowedTypes.length > 0 && !allowedTypes.includes(detectedType)) return json({ error: `File type not allowed for '${field.label}'.` }, 400, corsHeaders);
        if (detectedType === "video") hasVideoInField = true;
        attachmentUploadPlan.push({ formFieldKey, file, detectedType });
      }
      if (mandatoryVideoFieldIndexes.has(field.index) && !hasVideoInField) return json({ error: `'${field.label}' requires a video file.` }, 400, corsHeaders);
    }

    const [submission] = await db.insert(schema.projectFormSubmissions).values({ projectId, submitterUserId: user.id, fieldsJson: JSON.stringify(fieldsPayload) }).returning();

    let attachmentCount = 0;
    for (const item of attachmentUploadPlan) {
      const key = `project-form-submissions/${projectId}/${submission.id}/${crypto.randomUUID()}-${item.file.name}`;
      const buffer = await item.file.arrayBuffer();
      await env.BUCKET.put(key, buffer, { httpMetadata: { contentType: item.file.type || undefined } });
      await db.insert(schema.projectFormSubmissionAttachments).values({
        submissionId: submission.id, formFieldKey: item.formFieldKey, r2Key: key,
        fileName: item.file.name, fileSize: item.file.size, mimeType: item.file.type || "application/octet-stream",
        attachmentType: item.detectedType, assignedEvaluatorId: null, reviewStatus: "unassigned",
      });
      attachmentCount++;
    }

    await db.update(schema.projectFormShares).set({ submitterUserId: user.id }).where(and(eq(schema.projectFormShares.projectId, projectId), eq(schema.projectFormShares.submitterEmail, user.email)));

    return json({ success: true, submissionId: submission.id, attachmentsStored: attachmentCount }, 201, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleSubmitterExplore(req: Request, env: Env, db: any) {
  const corsHeaders = getCorsHeaders(req, env);
  try {
    const user = await getUserWithRole(req, env, db);
    if (!user) return json({ error: "Unauthorized" }, 403, corsHeaders);

    const activeProjects = await db.select().from(schema.projects).where(eq(schema.projects.status, "active"));
    const projectIds = activeProjects.map((p: any) => p.id);
    if (projectIds.length === 0) return json({ programs: [] }, 200, corsHeaders);

    const forms = await db.select().from(schema.projectForms).where(inArray(schema.projectForms.projectId, projectIds));
    const formByProjectId = new Map(forms.map((f: any) => [f.projectId, f]));

    const orgIds = [...new Set(activeProjects.map((p: any) => p.organizationId).filter(Boolean))] as number[];
    const orgs = orgIds.length ? await db.select().from(schema.organizations).where(inArray(schema.organizations.id, orgIds)) : [];
    const orgById = new Map(orgs.map((o: any) => [o.id, o]));

    const submissions = await db.select().from(schema.projectFormSubmissions).where(and(inArray(schema.projectFormSubmissions.projectId, projectIds), eq(schema.projectFormSubmissions.submitterUserId, user.id)));
    const submittedProjectIds = new Set(submissions.map((s: any) => s.projectId));

    const shares = await db.select().from(schema.projectFormShares).where(eq(schema.projectFormShares.submitterEmail, user.email));
    const invitedProjectIds = new Set(shares.map((s: any) => s.projectId));

    const programs = activeProjects
      .filter((project: any) => {
        const form = formByProjectId.get(project.id);
        if (!form) return false;
        try {
          const fields = normalizeProjectFormFields(JSON.parse(form.fieldsJson));
          return fields.some((f: any) => isMandatoryVideoField(f));
        } catch { return false; }
      })
      .map((project: any) => {
        const org = orgById.get(project.organizationId) || null;
        return {
          id: project.id, name: project.name, description: project.description, createdAt: project.createdAt,
          organization: org ? { id: org.id, name: org.name } : null,
          isInvited: invitedProjectIds.has(project.id),
          hasSubmitted: submittedProjectIds.has(project.id),
        };
      });

    return json({ programs }, 200, corsHeaders);
  } catch (e) {
    let message = "Internal server error";
    if (e instanceof Error) message = e.message;
    return json({ error: message }, 500, corsHeaders);
  }
}

