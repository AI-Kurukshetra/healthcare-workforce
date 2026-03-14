import { z } from "zod";

export const staffSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "staff"]),
  departmentId: z.string().uuid().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
});

export type StaffInput = z.infer<typeof staffSchema>;
