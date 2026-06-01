import { MailerType, Role, SmtpMailerAccountStatus, SmtpMailerHealthStatus, UserStatus } from "@prisma/client";

export function mapRole(role: Role) {
  return role.toLowerCase() as "admin" | "manager" | "employee";
}

export function mapUserStatus(status: UserStatus) {
  return status.toLowerCase() as "active" | "not_active";
}

export function mapMailerType(type: MailerType) {
  return type.toLowerCase() as "gmail" | "domain" | "mask";
}

export function mapSmtpMailerHealth(status: SmtpMailerHealthStatus) {
  return status.toLowerCase() as "active" | "burned" | "banned" | "not_working";
}

export function mapSmtpMailerAccountStatus(status: SmtpMailerAccountStatus) {
  return status.toLowerCase() as "active" | "paused" | "archived";
}

export function toPrismaRole(role: "admin" | "manager" | "employee") {
  return role.toUpperCase() as Role;
}

export function toPrismaMailerType(type: "gmail" | "domain" | "mask") {
  return type.toUpperCase() as MailerType;
}

export function toPrismaSmtpMailerAccountStatus(status: "active" | "paused" | "archived") {
  return status.toUpperCase() as SmtpMailerAccountStatus;
}

export function toPrismaSmtpMailerHealth(status: "active" | "burned" | "banned" | "not_working") {
  return status.toUpperCase() as SmtpMailerHealthStatus;
}