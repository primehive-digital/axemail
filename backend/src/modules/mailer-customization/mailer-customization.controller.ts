import type { Request, Response } from "express";

import {
  createReplyToOption,
  deleteReplyToOption,
  getMailerCustomizationDashboard,
  updateMailerCooldownSchedule,
  updateReplyToOption,
} from "@/services/mailer-customization.service";
import {
  createReplyToOptionSchema,
  mailerCustomizationMailerParamSchema,
  replyToOptionIdParamSchema,
  updateCooldownScheduleSchema,
  updateReplyToOptionSchema,
} from "@/modules/mailer-customization/mailer-customization.schemas";
import { asyncHandler } from "@/utils/async-handler";

export const getMailerCustomizationDashboardHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getMailerCustomizationDashboard() });
});

export const createReplyToOptionHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = createReplyToOptionSchema.parse(request.body);
  response.status(201).json({ data: await createReplyToOption(payload) });
});

export const updateReplyToOptionHandler = asyncHandler(async (request: Request, response: Response) => {
  const { optionId } = replyToOptionIdParamSchema.parse(request.params);
  const payload = updateReplyToOptionSchema.parse(request.body);
  response.json({ data: await updateReplyToOption({ optionId, ...payload }) });
});

export const deleteReplyToOptionHandler = asyncHandler(async (request: Request, response: Response) => {
  const { optionId } = replyToOptionIdParamSchema.parse(request.params);
  response.json({ data: await deleteReplyToOption(optionId) });
});

export const updateMailerCooldownScheduleHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = mailerCustomizationMailerParamSchema.parse(request.params);
  const payload = updateCooldownScheduleSchema.parse(request.body);
  response.json({ data: await updateMailerCooldownSchedule({ mailerType, schedule: payload.schedule }) });
});

