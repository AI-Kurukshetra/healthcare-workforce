import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StaffCredential, CredentialAlert } from "@/modules/staff/types";
import { listCredentialAlerts as listAlertsFromStaff } from "@/modules/staff/queries";

export type CredentialWithStaff = StaffCredential & {
  staff_id: string;
  staff_name: string | null;
};

export async function listCredentials(): Promise<CredentialWithStaff[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("id, staff_id, type, status, expires_at, license_number, profiles:profiles(full_name)")
    .order("expires_at", { ascending: true });

  if (error) {
    console.error("listCredentials failed", error.message);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      staff_id: row.staff_id,
      staff_name: (row as any)?.profiles?.full_name ?? null,
      type: row.type,
      status: row.status,
      expires_at: row.expires_at ?? null,
      license_number: row.license_number ?? null,
    })) ?? []
  );
}

export const listCredentialAlerts = async (): Promise<CredentialAlert[]> => listAlertsFromStaff();
