import { z } from "zod";

export const profileUpdateSchema = z.record(z.string());

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
