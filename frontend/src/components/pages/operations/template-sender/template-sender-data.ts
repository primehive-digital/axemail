import type { ComponentProps, ComponentType } from "react";
import {
  Eye,
  FileText,
  Globe2,
  Mail,
  Reply,
  Send,
  Shield,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

import { MailCooldownCard } from "@/components/shared/mail-cooldown-card";
import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";
import {
  MAILER_TYPE,
  MASK_MAILER_FROM_EMAIL_EXT,
  TEMPLATE_KEY,
  type MailerType,
  type TemplateKey,
} from "@/constants/enum";

export type TemplateSenderField = {
  id: string;
  label: string;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
  required?: boolean;
  type?: string;
};

export const mailerOptions = [
  {
    label: "Gmail Mailer",
    value: MAILER_TYPE.GMAIL,
    icon: Mail,
  },
  {
    label: "Domain Mailer",
    value: MAILER_TYPE.DOMAIN,
    icon: Globe2,
  },
  {
    label: "Mask Mailer",
    value: MAILER_TYPE.MASK,
    icon: Shield,
  },
] satisfies {
  label: string;
  value: MailerType;
  icon: ComponentType<{ className?: string }>;
}[];

export const templateOptions = Object.values(TEMPLATE_KEY).map(
  (value, index) => ({
    label: `Template ${String(index + 1).padStart(2, "0")}`,
    value,
  }),
);

export const maskEmailExtensions = Object.values(MASK_MAILER_FROM_EMAIL_EXT);

export const templateDetailFields: TemplateSenderField[] = [
  {
    id: "template-campaign-name",
    label: "Campaign Name",
    placeholder: "May trademark outreach",
    icon: Tag,
  },
  {
    id: "template-brand-name",
    label: "Brand Name",
    placeholder: "Axemail",
    icon: Sparkles,
  },
  {
    id: "template-reference-id",
    label: "Reference ID",
    placeholder: "AXE-2026-001",
    icon: FileText,
  },
];

export const deliveryFields: TemplateSenderField[] = [
  {
    id: "template-from-name",
    label: "From Name",
    required: true,
    placeholder: "Axemail Campaign Team",
    icon: User,
  },
  {
    id: "template-preview-text",
    label: "Preview Text",
    placeholder: "Short inbox preview shown before opening",
    icon: Eye,
  },
  {
    id: "template-to",
    label: "To",
    required: true,
    type: "email",
    placeholder: "recipient@company.com",
    icon: Send,
  },
  {
    id: "template-reply-to",
    label: "Reply-To",
    required: true,
    type: "email",
    placeholder: "reply@yourdomain.com",
    icon: Reply,
  },
  {
    id: "template-subject",
    label: "Subject",
    required: true,
    placeholder: "Write a clear email subject",
    icon: Sparkles,
  },
];

export const templateMailerData = {
  [MAILER_TYPE.GMAIL]: {
    capacity: {
      title: "Gmail Capacity",
      logoSrc: "/icons/gmail-capacity-logo.png",
      logoAlt: "Gmail capacity",
      allocated: 100,
      sent: 20,
    },
    cooldown: {
      title: "Mail Cooldown",
      remainingSeconds: 42,
      totalSeconds: 60,
    },
  },
  [MAILER_TYPE.DOMAIN]: {
    capacity: {
      title: "Domain Capacity",
      logoSrc: "/icons/domain-capacity-logo.png",
      logoAlt: "Domain capacity",
      allocated: 100,
      sent: 34,
    },
    cooldown: {
      title: "Mail Cooldown",
      remainingSeconds: 38,
      totalSeconds: 60,
    },
  },
  [MAILER_TYPE.MASK]: {
    capacity: {
      title: "Mask Capacity",
      logoSrc: "/icons/mask-capacity-logo.png",
      logoAlt: "Mask capacity",
      allocated: 100,
      sent: 18,
    },
    cooldown: {
      title: "Mail Cooldown",
      remainingSeconds: 0,
      totalSeconds: 60,
    },
  },
} satisfies Record<
  MailerType,
  {
    capacity: ComponentProps<typeof MailerCapacityCard>;
    cooldown: ComponentProps<typeof MailCooldownCard>;
  }
>;

export function formatTemplateKey(templateKey: TemplateKey) {
  return templateOptions.find((template) => template.value === templateKey)
    ?.label;
}
