import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionWithRole } from "@/modules/auth/queries";
import {
  createAdminSupabaseClient,
  ensureAuthUsersProvisioned,
  listAllAuthUsers,
} from "@/modules/auth/admin-sync";
import {
  StaffListItem,
  StaffDetail,
  StaffSkill,
  AvailabilityDay,
  StaffCredential,
  CredentialAlert,
  SkillMatrixShape,
  RegisteredProfileOption,
} from "./types";

function mapAvailability(value: unknown): AvailabilityDay[] | null {
  if (!value || typeof value !== "object") return null;
  try {
    return value as AvailabilityDay[];
  } catch {
    return null;
  }
}

function mapSkills(rows: any[] | null): StaffSkill[] {
  if (!rows) return [];
  return rows.map((r) => ({
    id: r.skill_id,
    name: r.skills?.name ?? "Skill",
    category: r.skills?.category ?? null,
    level: r.level ?? null,
    expires_at: r.expires_at ?? null,
    certification_number: r.certification_number ?? null,
  }));
}

function mapCredentials(rows: any[] | null): StaffCredential[] {
  if (!rows) return [];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status ?? "valid",
    expires_at: r.expires_at ?? null,
    license_number: r.license_number ?? null,
    days_remaining: r.days_remaining ?? null,
    alert_level: r.alert_level ?? null,
  }));
}

function isUserActive(bannedUntil?: string | null) {
  return !bannedUntil || new Date(bannedUntil).getTime() <= Date.now();
}

async function getAuthStatusMap(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, boolean>();

  try {
    const adminClient = createAdminSupabaseClient();
    const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;

    const allowedIds = new Set(userIds);
    return new Map(
      (data.users ?? [])
        .filter((user) => allowedIds.has(user.id))
        .map((user) => [user.id, isUserActive(user.banned_until)])
    );
  } catch (error) {
    console.error("getAuthStatusMap failed", error);
    return new Map<string, boolean>();
  }
}

async function syncAuthUsersForAdmin() {
  const authUsers = await listAllAuthUsers();
  await ensureAuthUsersProvisioned(
    authUsers.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }))
  );

  return authUsers;
}

export async function listRegisteredUserOptions(): Promise<RegisteredProfileOption[]> {
  const ctx = await getSessionWithRole();
  if (ctx?.role !== "admin") return [];

  try {
    await syncAuthUsersForAdmin();
    const adminClient = createAdminSupabaseClient();
    const [{ data: profiles, error: profilesError }, { data: staffRows, error: staffError }] = await Promise.all([
      adminClient.from("profiles").select("id, full_name, email, role").order("full_name"),
      adminClient.from("staff").select("id"),
    ]);

    if (profilesError) throw profilesError;
    if (staffError) throw staffError;

    const existingStaffIds = new Set((staffRows ?? []).map((row) => row.id));
    return (profiles ?? [])
      .filter((profile) => !existingStaffIds.has(profile.id))
      .map((profile) => ({
        id: profile.id,
        fullName: profile.full_name ?? "",
        email: profile.email,
        role: profile.role ?? "staff",
      }));
  } catch (error) {
    console.error("listRegisteredUserOptions failed", error);
    return [];
  }
}

export async function listStaff(): Promise<StaffListItem[]> {
  const supabase = createSupabaseServerClient();
  const ctx = await getSessionWithRole();
  const profileRelation =
    ctx?.role === "manager" ? "profiles:profiles!staff_id_fkey!inner" : "profiles:profiles!staff_id_fkey";

  // Staff should not list all staff; return self if needed later.
  if (ctx?.role === "staff") return [];
  if (ctx?.role === "manager" && !ctx.departmentId) return [];

  if (ctx?.role === "admin") {
    try {
      await syncAuthUsersForAdmin();
    } catch (error) {
      console.error("listStaff auth sync failed", error);
    }
  }

  let query = supabase
    .from("staff")
    .select(
      `
      id,
      title,
      phone,
      shift_preference,
      availability,
      ${profileRelation}(full_name,email,role,department_id),
      staff_skills(skill_id, level, expires_at, certification_number, skills(name, category))
    `
    )
    .order("full_name", { referencedTable: "profiles" });

  if (ctx?.role === "manager" && ctx.departmentId) {
    query = query.eq("profiles.department_id", ctx.departmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listStaff failed", error.message);
    // Permission errors should surface as empty list to avoid crashing UI
    return [];
  }

  const authStatusMap = await getAuthStatusMap((data ?? []).map((row) => row.id));

  return (
    data?.map((row) => ({
      id: row.id,
      name: (row as any).profiles?.full_name ?? "Unnamed",
      role: (row as any).profiles?.role ?? "staff",
      isActive: authStatusMap.get(row.id) ?? true,
      title: row.title,
      phone: row.phone,
      email: (row as any).profiles?.email ?? null,
      shift_preference: row.shift_preference,
      availability: mapAvailability(row.availability),
      skills: mapSkills(row.staff_skills),
    })) ?? []
  );
}

export async function getStaffById(id: string): Promise<StaffDetail | null> {
  const supabase = createSupabaseServerClient();
  const ctx = await getSessionWithRole();
  const profileRelation =
    ctx?.role === "manager" ? "profiles:profiles!staff_id_fkey!inner" : "profiles:profiles!staff_id_fkey";

  if (ctx?.role === "manager" && !ctx.departmentId) {
    return null;
  }

  let query = supabase
    .from("staff")
    .select(
      `
      id,
      title,
      phone,
      shift_preference,
      availability,
      emergency_contact,
      ${profileRelation}(full_name,email,role,department_id,unit_id),
      staff_skills(skill_id, level, expires_at, certification_number, skills(name, category))
    `
    )
    .eq("id", id);

  // Managers can only access staff in their department
  if (ctx?.role === "manager" && ctx.departmentId) {
    query = query.eq("profiles.department_id", ctx.departmentId);
  }

  // Staff can only view self
  if (ctx?.role === "staff" && ctx.session?.user.id !== id) {
    return null;
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    if (error) console.error("getStaffById failed", error.message);
    return null;
  }

  const { data: credRows, error: credError } = await supabase
    .from("credentials")
    .select("id, type, status, expires_at, license_number")
    .eq("staff_id", id)
    .order("expires_at", { ascending: true });
  if (credError) console.error("getStaff credentials failed", credError.message);

  const authStatusMap = await getAuthStatusMap([id]);

  const profile = (data as any).profiles;
  const fullName = profile?.full_name || "";
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  return {
    id: data.id,
    name: fullName || "Unnamed",
    firstName: firstName || "",
    lastName: lastName || "",
    role: profile?.role ?? "staff",
    isActive: authStatusMap.get(id) ?? true,
    departmentId: profile?.department_id ?? null,
    unitId: profile?.unit_id ?? null,
    title: data.title,
    phone: data.phone,
    email: (data as any).profiles?.email ?? null,
    shift_preference: data.shift_preference,
    availability: mapAvailability(data.availability),
    emergency_contact: (data.emergency_contact as any) ?? null,
    skills: mapSkills(data.staff_skills),
    credentials: mapCredentials(credRows),
  };
}

export async function getSkillMatrix(): Promise<SkillMatrixShape> {
  const supabase = createSupabaseServerClient();
  const [{ data, error }, staffList] = await Promise.all([
    supabase
      .from("staff_skill_matrix")
      .select(
        "staff_id, full_name, role, title, phone, shift_preference, skill_id, skill_name, category, level, expires_at, certification_number"
      ),
    listStaff(),
  ]);

  const skills = new Map<string, { id: string; name: string; category: string | null }>();
  const staff = new Map<string, StaffListItem & { skills: StaffSkill[] }>();

  if (error) console.error("getSkillMatrix failed", error.message);

  (data ?? []).forEach((row) => {
    if (row.skill_id && row.skill_name) {
      skills.set(row.skill_id, { id: row.skill_id, name: row.skill_name, category: row.category ?? null });
    }
    const existing: StaffListItem & { skills: StaffSkill[] } = staff.get(row.staff_id) ?? {
      id: row.staff_id,
      name: row.full_name ?? "Unnamed",
      role: row.role ?? "staff",
      isActive: true,
      title: row.title ?? null,
      phone: row.phone ?? null,
      email: null,
      shift_preference: row.shift_preference ?? null,
      availability: null,
      skills: [] as StaffSkill[],
    };

    existing.skills.push({
      id: row.skill_id,
      name: row.skill_name,
      category: row.category ?? null,
      level: row.level ?? null,
      expires_at: row.expires_at ?? null,
      certification_number: row.certification_number ?? null,
    });

    staff.set(row.staff_id, existing);
  });

  // Ensure staff with no recorded skills still appear in the matrix
  staffList.forEach((person) => {
    if (!staff.has(person.id)) {
      staff.set(person.id, { ...person, skills: [] });
    }
    person.skills.forEach((skill) => {
      skills.set(skill.id, { id: skill.id, name: skill.name, category: skill.category ?? null });
    });
  });

  return {
    skills: Array.from(skills.values()),
    staff: Array.from(staff.values()),
  };
}

export async function listCredentialAlerts(): Promise<CredentialAlert[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credential_alerts")
    .select("*")
    .in("alert_level", ["expired", "expiring_soon"])
    .order("expires_at", { ascending: true });

  if (error) {
    console.error("listCredentialAlerts failed", error.message);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      staff_id: row.staff_id,
      staff_name: row.full_name ?? null,
      type: row.type,
      status: row.status,
      expires_at: row.expires_at,
      license_number: row.license_number ?? null,
      days_remaining: row.days_remaining ?? null,
      alert_level: row.alert_level ?? null,
    })) ?? []
  );
}
