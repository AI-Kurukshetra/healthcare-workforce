import { cookies, headers } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

// Supabase client for server actions (sets auth cookies correctly)
export const createSupabaseActionClient = () => createServerActionClient({ cookies });
