import { createClient } from "@supabase/supabase-js";

export type AppRole = "admin" | "manager" | "staff";

type SyncableAuthUser = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
};

type AuthUserSummary = {
  id: string;
  email: string | null;
  fullName: string;
  role: AppRole;
  bannedUntil: string | null;
};

export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Service role key is missing");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function normalizeAppRole(role: unknown): AppRole {
  return role === "admin" || role === "manager" ? role : "staff";
}

export async function listAllAuthUsers(): Promise<AuthUserSummary[]> {
  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  return (data.users ?? []).map((user) => ({
    id: user.id,
    email: user.email ?? null,
    fullName: (user.user_metadata?.full_name as string | undefined) ?? "",
    role: normalizeAppRole(user.user_metadata?.role),
    bannedUntil: user.banned_until ?? null,
  }));
}

export async function ensureAuthUsersProvisioned(users: SyncableAuthUser[]) {
  const normalizedUsers = users
    .filter((user): user is Required<Pick<SyncableAuthUser, "id">> & SyncableAuthUser => Boolean(user.id))
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      full_name: user.fullName?.trim() ?? "",
      role: normalizeAppRole(user.role),
    }));

  if (normalizedUsers.length === 0) return;

  const adminClient = createAdminSupabaseClient();
  const userIds = normalizedUsers.map((user) => user.id);

  const [
    { data: existingProfiles, error: profilesError },
    { data: existingStaff, error: staffError },
    { data: existingUserRoles, error: userRolesError },
    { data: roles, error: rolesError },
  ] = await Promise.all([
    adminClient.from("profiles").select("id").in("id", userIds),
    adminClient.from("staff").select("id").in("id", userIds),
    adminClient.from("user_roles").select("user_id").in("user_id", userIds),
    adminClient.from("roles").select("id, slug").in("slug", ["admin", "manager", "staff"]),
  ]);

  if (profilesError) throw profilesError;
  if (staffError) throw staffError;
  if (userRolesError) throw userRolesError;
  if (rolesError) throw rolesError;

  const profileIds = new Set((existingProfiles ?? []).map((row) => row.id));
  const staffIds = new Set((existingStaff ?? []).map((row) => row.id));
  const userRoleIds = new Set((existingUserRoles ?? []).map((row) => row.user_id));
  const roleMap = new Map((roles ?? []).map((row) => [row.slug, row.id]));

  const missingProfiles = normalizedUsers
    .filter((user) => !profileIds.has(user.id) && user.email)
    .map((user) => ({
      id: user.id,
      email: user.email!,
      full_name: user.full_name,
      role: user.role,
    }));

  if (missingProfiles.length > 0) {
    const { error } = await adminClient.from("profiles").insert(missingProfiles);
    if (error) throw error;
  }

  const missingStaff = normalizedUsers.filter((user) => !staffIds.has(user.id)).map((user) => ({ id: user.id }));
  if (missingStaff.length > 0) {
    const { error } = await adminClient.from("staff").insert(missingStaff);
    if (error) throw error;
  }

  const missingUserRoles = normalizedUsers
    .filter((user) => !userRoleIds.has(user.id))
    .map((user) => {
      const roleId = roleMap.get(user.role);
      if (!roleId) return null;

      return {
        user_id: user.id,
        role_id: roleId,
      };
    })
    .filter((row): row is { user_id: string; role_id: number } => row !== null);

  if (missingUserRoles.length > 0) {
    const { error } = await adminClient.from("user_roles").insert(missingUserRoles);
    if (error) throw error;
  }
}
