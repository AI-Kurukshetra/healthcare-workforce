import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  StaffListItem,
  StaffDetail,
  StaffSkill,
  AvailabilityDay,
  StaffCredential,
  CredentialAlert,
  SkillMatrixShape,
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

export async function listStaff(): Promise<StaffListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff")
    .select(
      `
      id,
      title,
      phone,
      shift_preference,
      availability,
      profiles:profiles!staff_id_fkey(full_name,email,role),
      staff_skills(skill_id, level, expires_at, certification_number, skills(name, category))
    `
    )
    .order("full_name", { referencedTable: "profiles" });

  if (error) {
    console.error("listStaff failed", error.message);
    // Permission errors should surface as empty list to avoid crashing UI
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      name: (row as any).profiles?.full_name ?? "Unnamed",
      role: (row as any).profiles?.role ?? "staff",
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
  const { data, error } = await supabase
    .from("staff")
    .select(
      `
      id,
      title,
      phone,
      shift_preference,
      availability,
      emergency_contact,
      profiles:profiles!staff_id_fkey(full_name,email,role,department_id,unit_id),
      staff_skills(skill_id, level, expires_at, certification_number, skills(name, category))
    `
    )
    .eq("id", id)
    .maybeSingle();

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
