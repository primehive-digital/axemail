import { Role, UserStatus } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/app-error";

export async function resolveUserContext(input: { role?: string; userId?: string }) {
  if (input.userId) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("User account is not active.", 403);
    }
    return user;
  }

  if (input.role) {
    const role = input.role.toUpperCase() as Role;
    const user = await prisma.user.findFirst({
      where: { role, status: UserStatus.ACTIVE },
      orderBy: { createdAt: "asc" },
    });
    if (!user) {
      throw new AppError("User not found for role.", 404);
    }
    return user;
  }

  const fallback = await prisma.user.findFirst({ where: { status: UserStatus.ACTIVE }, orderBy: { createdAt: "asc" } });
  if (!fallback) {
    throw new AppError("No users available.", 404);
  }
  return fallback;
}
