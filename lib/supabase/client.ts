"use client";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

export const createSupabaseBrowserClient = () => createBrowserSupabaseClient();
