import type { Request, Response } from "express";

import {
  createAutomationLeads,
  createAutomationWorker,
  getAutomationDashboard,
  processAutomationWorkerDueLeads,
  updateAutomationLead,
  updateAutomationWorker,
} from "@/services/automation.service";
import { asyncHandler } from "@/utils/async-handler";
import {
  createAutomationLeadsSchema,
  createAutomationWorkerSchema,
  leadIdSchema,
  processAutomationWorkerSchema,
  updateAutomationLeadSchema,
  updateAutomationWorkerSchema,
  workerIdSchema,
} from "@/modules/automation/automation.schemas";

export const getAutomationDashboardHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({ data: await getAutomationDashboard({ role: request.auth!.role, userId: request.auth!.userId }) });
});

export const createAutomationWorkerHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = createAutomationWorkerSchema.parse(request.body);
  response.status(201).json({ data: await createAutomationWorker({ ...payload, createdById: request.auth!.userId }) });
});

export const updateAutomationWorkerHandler = asyncHandler(async (request: Request, response: Response) => {
  const { workerId } = workerIdSchema.parse(request.params);
  const payload = updateAutomationWorkerSchema.parse(request.body);
  response.json({ data: await updateAutomationWorker(workerId, payload) });
});

export const createAutomationLeadsHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = createAutomationLeadsSchema.parse(request.body);
  response.status(201).json({ data: await createAutomationLeads(payload) });
});

export const updateAutomationLeadHandler = asyncHandler(async (request: Request, response: Response) => {
  const { leadId } = leadIdSchema.parse(request.params);
  const payload = updateAutomationLeadSchema.parse(request.body);
  response.json({ data: await updateAutomationLead(leadId, payload) });
});

export const processAutomationWorkerHandler = asyncHandler(async (request: Request, response: Response) => {
  const { workerId } = workerIdSchema.parse(request.params);
  const payload = processAutomationWorkerSchema.parse(request.body ?? {});
  response.json({ data: await processAutomationWorkerDueLeads(workerId, payload.limit) });
});
