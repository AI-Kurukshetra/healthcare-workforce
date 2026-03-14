import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).optional(),
});

export type AuthInput = z.infer<typeof authSchema>;
