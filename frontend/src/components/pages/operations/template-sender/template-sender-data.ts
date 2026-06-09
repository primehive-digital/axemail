import type { ComponentType } from "react";
import { Eye, Globe2, Mail, Send, Shield, User } from "lucide-react";

import { MAILER_TYPE, MASK_MAILER_FROM_EMAIL_EXT, type MailerType } from "@/constants/enum";

export type TemplateSenderField = {
  name: string;
  label: string;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
  required?: boolean;
  type?: string;
};

export const mailerOptions = [
  { label: "Gmail Mailer", value: MAILER_TYPE.GMAIL, icon: Mail },
  { label: "Domain Mailer", value: MAILER_TYPE.DOMAIN, icon: Globe2 },
  { label: "Mask Mailer", value: MAILER_TYPE.MASK, icon: Shield },
] satisfies Array<{ label: string; value: MailerType; icon: ComponentType<{ className?: string }> }>;

export const maskEmailExtensions = Object.values(MASK_MAILER_FROM_EMAIL_EXT);

export const deliveryFields: TemplateSenderField[] = [
  { name: "fromName", label: "From Name", required: true, placeholder: "Axemail Campaign Team", icon: User },
  { name: "previewText", label: "Preview Text", placeholder: "Short inbox preview shown before opening", icon: Eye },
  { name: "to", label: "To", required: true, type: "email", placeholder: "recipient@company.com", icon: Send },
];

export function getCapacityLogo(mailerType: MailerType) {
  if (mailerType === MAILER_TYPE.GMAIL) return { logoSrc: "/icons/gmail-capacity-logo.png", logoAlt: "Gmail capacity" };
  if (mailerType === MAILER_TYPE.DOMAIN) return { logoSrc: "/icons/domain-capacity-logo.png", logoAlt: "Domain capacity" };
  return { logoSrc: "/icons/mask-capacity-logo.png", logoAlt: "Mask capacity" };
}



