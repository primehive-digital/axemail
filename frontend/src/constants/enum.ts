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

export const MAILER_SMTP_HEALTH = {
    ACTIVE: "active",
    BURNED: "burned",
    BANNED: "banned",
    NOT_WORKING: "not_working",
} as const;

export const MASK_MAILER_FROM_EMAIL_EXT = {
    GOV_V1: "gơv",
    GOV_V2: "gọv",
    GOV_V3: "ġov",
    GOV_V4: "ģơv",
    GOV_V5: "gòv",
    US: "us",
    COM: "com",
    ORG: "org",
} as const;

export const TEMPLATE_KEY = {
    TEMPLATE_01: "template-01",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type MailerType = (typeof MAILER_TYPE)[keyof typeof MAILER_TYPE];
export type MailerSmtpHealth = (typeof MAILER_SMTP_HEALTH)[keyof typeof MAILER_SMTP_HEALTH];
export type MaskMailerFromEmailExt =
    (typeof MASK_MAILER_FROM_EMAIL_EXT)[keyof typeof MASK_MAILER_FROM_EMAIL_EXT];
export type TemplateKey = (typeof TEMPLATE_KEY)[keyof typeof TEMPLATE_KEY];