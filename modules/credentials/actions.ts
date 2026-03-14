"use server";
import { upsertCredential as upsertStaffCredential, deleteCredential as deleteStaffCredential } from "@/modules/staff/actions";

// Alias to keep credentials module API stable
export const addCredential = upsertStaffCredential;
export const upsertCredential = upsertStaffCredential;
export const deleteCredential = deleteStaffCredential;
