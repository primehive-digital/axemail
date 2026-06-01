export const USER_ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

export const MAILER_TYPE = {
  GMAIL: "gmail",
  DOMAIN: "domain",
  MASK: "mask",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  NOT_ACTIVE: "not_active",
} as const;

export const SMTP_MAILER_HEALTH = {
  ACTIVE: "active",
  BURNED: "burned",
  BANNED: "banned",
  NOT_WORKING: "not_working",
} as const;

export const SMTP_MAILER_ACCOUNT_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  ARCHIVED: "archived",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type MailerType = (typeof MAILER_TYPE)[keyof typeof MAILER_TYPE];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export type SmtpMailerHealth = (typeof SMTP_MAILER_HEALTH)[keyof typeof SMTP_MAILER_HEALTH];
export type SmtpMailerAccountStatus = (typeof SMTP_MAILER_ACCOUNT_STATUS)[keyof typeof SMTP_MAILER_ACCOUNT_STATUS];