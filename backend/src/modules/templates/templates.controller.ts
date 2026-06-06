import type { Request, Response } from "express";

import {
  createTemplate,
  deleteTemplate,
  getTemplateSenderDashboard,
  listTemplates,
  sendTemplateMail,
  updateTemplate,
} from "@/services/template.service";
import {
  createTemplateSchema,
  sendTemplateSchema,
  templateIdSchema,
  templateSenderQuerySchema,
  updateTemplateSchema,
} from "@/modules/templates/templates.schemas";
import { asyncHandler } from "@/utils/async-handler";

export const listTemplatesHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({ data: await listTemplates({ role: request.auth!.role, userId: request.auth!.userId }) });
});

export const createTemplateHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = createTemplateSchema.parse(request.body);
  response.status(201).json({ data: await createTemplate({ ...payload, createdById: request.auth!.userId }) });
});

export const updateTemplateHandler = asyncHandler(async (request: Request, response: Response) => {
  const { templateId } = templateIdSchema.parse(request.params);
  const payload = updateTemplateSchema.parse(request.body);
  response.json({ data: await updateTemplate({ templateId, role: request.auth!.role, userId: request.auth!.userId, input: payload }) });
});

export const deleteTemplateHandler = asyncHandler(async (request: Request, response: Response) => {
  const { templateId } = templateIdSchema.parse(request.params);
  response.json({ data: await deleteTemplate({ templateId, role: request.auth!.role, userId: request.auth!.userId }) });
});

export const getTemplateSenderDashboardHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = templateSenderQuerySchema.parse(request.query);
  response.json({ data: await getTemplateSenderDashboard({ userId: request.auth!.userId, mailerType }) });
});

export const sendTemplateHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = sendTemplateSchema.parse(request.body);
  response.status(201).json({ data: await sendTemplateMail({ ...payload, userId: request.auth!.userId, role: request.auth!.role }) });
});