import { Role } from "@prisma/client";
import { Router } from "express";

import {
  changePasswordHandler,
  createUserHandler,
  deleteUserHandler,
  getProfileHandler,
  getUsersHandler,
  terminateSessionHandler,
  updateProfileHandler,
  updateUserHandler,
} from "@/modules/users/users.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const usersRouter = Router();

usersRouter.get("/users", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), getUsersHandler);
usersRouter.post("/users", requireAuthenticatedUser, requireRoles(Role.ADMIN), createUserHandler);
usersRouter.patch("/users/:userId", requireAuthenticatedUser, requireRoles(Role.ADMIN), updateUserHandler);
usersRouter.delete("/users/:userId", requireAuthenticatedUser, requireRoles(Role.ADMIN), deleteUserHandler);
usersRouter.get("/profile", requireAuthenticatedUser, getProfileHandler);
usersRouter.patch("/profile", requireAuthenticatedUser, updateProfileHandler);
usersRouter.patch("/profile/password", requireAuthenticatedUser, changePasswordHandler);
usersRouter.post("/users/terminate-session", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), terminateSessionHandler);
