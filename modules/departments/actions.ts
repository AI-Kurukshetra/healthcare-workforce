"use server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const deptSchema = z.object({ name: z.string().min(2) });
const unitSchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(2),
});

export async function createDepartment(input: unknown) {
  const data = deptSchema.parse(input);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("departments").insert({ name: data.name });
  if (error) throw error;
  revalidatePath("/departments");
}

export async function createUnit(input: unknown) {
  const data = unitSchema.parse(input);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("units").insert({
    department_id: data.departmentId,
    name: data.name,
  });
  if (error) throw error;
  revalidatePath("/departments");
}
