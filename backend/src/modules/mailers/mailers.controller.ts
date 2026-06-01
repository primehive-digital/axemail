import type { Request, Response } from "express";

import { MAILER_TYPE } from "@/constants/enums";
import { sendComposerCampaign } from "@/services/mailer-delivery.service";
import { asyncHandler } from "@/utils/async-handler";
import { domainMailerSchema, gmailMailerSchema, maskMailerSchema } from "@/modules/mailers/mailers.schemas";

export const sendGmailHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = gmailMailerSchema.parse(request.body);
  response.status(201).json({
    data: await sendComposerCampaign({
      ...payload,
      userId: request.auth!.userId,
      role: request.auth!.role,
      mailerType: MAILER_TYPE.GMAIL,
    }),
  });
});

export const sendDomainHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = domainMailerSchema.parse(request.body);
  response.status(201).json({
    data: await sendComposerCampaign({
      ...payload,
      userId: request.auth!.userId,
      role: request.auth!.role,
      mailerType: MAILER_TYPE.DOMAIN,
    }),
  });
});

export const sendMaskHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = maskMailerSchema.parse(request.body);
  response.status(201).json({
    data: await sendComposerCampaign({
      ...payload,
      userId: request.auth!.userId,
      role: request.auth!.role,
      mailerType: MAILER_TYPE.MASK,
    }),
  });
});
