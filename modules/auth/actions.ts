"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseActionClient } from "@/lib/supabase/action";
import { authSchema } from "./validation";

export async function signIn(input: unknown) {
  const data = authSchema.parse(input);
  const supabase = createSupabaseActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function signUp(input: unknown, role: "admin" | "manager" | "staff" = "staff") {
  const data = authSchema.parse(input);
  const supabase = createSupabaseActionClient();
  const { data: signUpRes, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { role, full_name: data.fullName } },
  });
  if (error) throw error;

  // If session exists (email confirmed or magic link), attach default role
  const userId = signUpRes.user?.id;
  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      email: data.email,
      full_name: data.fullName ?? signUpRes.user?.user_metadata?.full_name ?? "",
      role,
    });

    const roleId = await getRoleId(role, supabase);
    if (roleId) {
      await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: roleId,
      });
    }
  }
}

async function getRoleId(
  slug: "admin" | "manager" | "staff",
  supabase: ReturnType<typeof createSupabaseActionClient>
) {
  const { data } = await supabase.from("roles").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}
