import type { UserRole, UserStatus } from "@/constants/enum";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  pseudoName?: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
  user: AuthUser;
};

export type ClientAuthSession = {
  user: AuthUser;
};