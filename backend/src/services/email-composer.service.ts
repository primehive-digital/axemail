import crypto from "node:crypto";

import type { ProviderDispatchPayload } from "@/types/mailer.types";

export function buildEmailHeaders(input: {
  deliveryId: string;
  deliveryRecordId: string;
  mailerType: string;
  previewText?: string;
}) {
  const timestamp = new Date().toUTCString();
  const messageId = `<${crypto.randomUUID()}.${input.deliveryRecordId}@axemail.local>`;

  return {
    Date: timestamp,
    "Message-ID": messageId,
    "X-Mailer": "Axemail Mail Engine",
    "X-Axemail-Delivery-Id": input.deliveryId,
    "X-Axemail-Delivery-Record-Id": input.deliveryRecordId,
    "X-Axemail-Mailer-Type": input.mailerType,
    "MIME-Version": "1.0",
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    "X-Priority": "3",
    ...(input.previewText ? { "X-Axemail-Preview-Text": input.previewText } : {}),
  };
}

export function buildEnvelope(payload: ProviderDispatchPayload) {
  return {
    from: payload.fromEmail,
    to: [payload.to, ...payload.cc, ...payload.bcc],
  };
}
