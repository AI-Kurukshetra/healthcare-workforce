 "use server";
 
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseActionClient } from "@/lib/supabase/action";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/db";

const contactSchema = z.object({
  staffId: z.string().uuid(),
  phone: z.string().min(7).optional().nullable(),
  title: z.string().optional().nullable(),
  shiftPreference: z.string().optional().nullable(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional()
    .nullable(),
});

const availabilitySchema = z.object({
  staffId: z.string().uuid(),
  availability: z
    .array(
      z.object({
        day: z.string(),
        ranges: z.array(
          z.object({
            start: z.string(),
            end: z.string(),
          })
        ),
      })
    )
    .optional()
    .nullable(),
});

const staffProfileSchema = z.object({
  staffId: z.string().uuid(),
  title: z.string().min(2).optional().nullable(),
  phone: z.string().min(7).optional().nullable(),
  shiftPreference: z.string().optional().nullable(),
  availability: availabilitySchema.shape.availability.optional().nullable(),
  emergencyContact: contactSchema.shape.emergencyContact,
});

const upsertSkillSchema = z.object({
  staffId: z.string().uuid(),
  skillName: z.string().min(2),
  category: z.string().optional().nullable(),
  level: z.enum(["novice", "intermediate", "advanced", "expert"]).default("intermediate"),
  certificationNumber: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

const credentialSchema = z.object({
  id: z.string().uuid().optional(),
  staffId: z.string().uuid(),
  type: z.string().min(2),
  licenseNumber: z.string().optional().nullable(),
  issuedBy: z.string().optional().nullable(),
  issuedAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  status: z.enum(["valid", "expiring", "expired", "suspended"]).default("valid"),
  documentUrl: z.string().url().optional().nullable(),
});

const toDateString = (value?: Date | null) => (value ? value.toISOString().slice(0, 10) : null);

export async function upsertStaffProfile(input: unknown) {
  const data = staffProfileSchema.parse(input);
  const supabase = createSupabaseActionClient();

  const { error } = await supabase.from("staff").upsert({
    id: data.staffId,
    title: data.title ?? null,
    phone: data.phone ?? null,
    shift_preference: data.shiftPreference ?? null,
    availability: data.availability ?? null,
    emergency_contact: data.emergencyContact ?? null,
  });

  if (error) throw new Error(error.message ?? "Unable to save staff profile");
  revalidatePath(`/staff/${data.staffId}`);
  revalidatePath(`/staff`);
}

export async function updateStaffContact(input: unknown) {
  const data = contactSchema.parse(input);
  const supabase = createSupabaseActionClient();

  const { error } = await supabase
    .from("staff")
    .update({
      phone: data.phone ?? null,
      title: data.title ?? null,
      shift_preference: data.shiftPreference ?? null,
      emergency_contact: data.emergencyContact ?? null,
    })
    .eq("id", data.staffId);

  if (error) throw new Error(error.message ?? "Unable to update staff contact");
  revalidatePath(`/staff/${data.staffId}`);
}

export async function updateAvailability(input: unknown) {
  const data = availabilitySchema.parse(input);
  const supabase = createSupabaseActionClient();

  const { error } = await supabase
    .from("staff")
    .update({ availability: data.availability ?? null })
    .eq("id", data.staffId);

  if (error) throw new Error(error.message ?? "Unable to update availability");
  revalidatePath(`/staff/${data.staffId}`);
}

export async function upsertStaffSkill(input: unknown) {
  const data = upsertSkillSchema.parse(input);
  const supabase = createSupabaseActionClient();

  // Ensure skill exists
  const { data: skillRow, error: skillError } = await supabase
    .from("skills")
    .upsert({ name: data.skillName.trim(), category: data.category ?? null }, { onConflict: "name" })
    .select("id")
    .maybeSingle();
  if (skillError) throw new Error(skillError.message ?? "Unable to upsert skill");
  const skillId = skillRow?.id;
  if (!skillId) throw new Error("Skill ID not returned");

  const { error } = await supabase.from("staff_skills").upsert({
    staff_id: data.staffId,
    skill_id: skillId,
    level: data.level,
    certification_number: data.certificationNumber ?? null,
    expires_at: data.expiresAt ?? null,
  });
  if (error) throw new Error(error.message ?? "Unable to save staff skill");

  revalidatePath(`/staff/${data.staffId}`);
}

export async function removeStaffSkill(staffId: string, skillId: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase.from("staff_skills").delete().eq("staff_id", staffId).eq("skill_id", skillId);
  if (error) throw new Error(error.message ?? "Unable to remove skill");
  revalidatePath(`/staff/${staffId}`);
}

export async function upsertCredential(input: unknown) {
  const data = credentialSchema.parse(input);
  const supabase = createSupabaseActionClient();

  const payload = {
    staff_id: data.staffId,
    type: data.type,
    license_number: data.licenseNumber ?? null,
    issued_by: data.issuedBy ?? null,
    issued_at: toDateString(data.issuedAt),
    expires_at: toDateString(data.expiresAt),
    status: data.status,
    document_url: data.documentUrl ?? null,
  };

  if (data.id) {
    const { error } = await supabase.from("credentials").update(payload).eq("id", data.id);
    if (error) throw new Error(error.message ?? "Unable to update credential");
  } else {
    const { error } = await supabase.from("credentials").insert(payload);
    if (error) throw new Error(error.message ?? "Unable to add credential");
  }

  revalidatePath("/credentials");
  revalidatePath(`/staff/${data.staffId}`);
}

export async function deleteCredential(id: string, staffId?: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase.from("credentials").delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Unable to delete credential");
  if (staffId) revalidatePath(`/staff/${staffId}`);
  revalidatePath("/credentials");
}

export async function createStaff(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "staff";
  employmentType?: string;
  departmentId?: string;
  unitId?: string;
}) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Service role key is missing");

  // Use service role for admin auth creation
  const adminAuthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const fullName = `${data.firstName} ${data.lastName}`.trim();

  // Create auth.user
  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email: data.email,
    password: "Password123!", // Enforce secure password reset flow in production
    email_confirm: true,
    user_metadata: { full_name: fullName, role: data.role },
  });

  if (authError) throw new Error(`Auth creation failed: ${authError.message}`);
  const userId = authData.user.id;

  // Insert Profile
  const { error: profileError } = await adminAuthClient.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    email: data.email,
    role: data.role,
    department_id: data.departmentId || null,
    unit_id: data.unitId || null,
  });
  if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

  // Insert Staff extended details
  const { error: staffError } = await adminAuthClient.from("staff").upsert({
    id: userId,
    title: data.employmentType || null,
    phone: data.phone || null,
  });
  if (staffError) throw new Error(`Staff details creation failed: ${staffError.message}`);

  // Optional: resolve role to role_id in user_roles
  const { data: roleData } = await adminAuthClient
    .from("roles")
    .select("id")
    .eq("slug", data.role)
    .maybeSingle();

  if (roleData) {
    await adminAuthClient.from("user_roles").upsert({ user_id: userId, role_id: roleData.id });
  }

  revalidatePath("/staff");
  return userId;
}

export async function updateStaff(data: {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "staff";
  employmentType?: string;
  departmentId?: string;
  unitId?: string;
}) {
  if (!data.id) throw new Error("Staff ID is required for update");
  const supabase = createSupabaseActionClient();
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role: data.role,
      department_id: data.departmentId || null,
      unit_id: data.unitId || null,
    })
    .eq("id", data.id);
  if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);

  const { error: staffError } = await supabase
    .from("staff")
    .update({
      title: data.employmentType || null,
      phone: data.phone || null,
    })
    .eq("id", data.id);
  if (staffError) throw new Error(`Staff details update failed: ${staffError.message}`);

  // Sync role to user_roles
  const { data: roleData } = await supabase
    .from("roles")
    .select("id")
    .eq("slug", data.role)
    .maybeSingle();

  if (roleData) {
    await supabase.from("user_roles").update({ role_id: roleData.id }).eq("user_id", data.id);
  }

  revalidatePath(`/staff/${data.id}`);
  revalidatePath("/staff");
}
