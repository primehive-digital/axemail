import { z } from "zod";

import { toPrismaRole } from "@/utils/enum-mappers";

const accountRoleSchema = z.enum(["manager", "employee"]).transform(toPrismaRole);

export const userIdSchema = z.object({
  userId: z.string().min(1),
});

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  pseudoName: z.string().trim().min(1),
  email: z.email().toLowerCase(),
  role: accountRoleSchema,
  password: z.string().min(8),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  pseudoName: z.string().trim().min(1).optional(),
  email: z.email().toLowerCase().optional(),
  role: accountRoleSchema.optional(),
  password: z.string().min(8).optional(),
});

export const terminateSessionSchema = z.object({
  userId: z.string().min(1),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  pseudoName: z.string().trim().min(1),
  email: z.email().toLowerCase().optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password and confirm password must match.",
    path: ["confirmPassword"],
  });