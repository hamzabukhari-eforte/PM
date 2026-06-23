import { z } from "zod";
import type { Project } from "@/lib/api/types";
import {
  isoOrDateToTicketDateLocal,
  parseTicketDateLocal,
} from "@/lib/utils/ticket-datetime";

export const projectFormSchema = z
  .object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    projectCode: z.string().optional(),
    brdReceivingDate: z
      .string()
      .optional()
      .refine((s) => !s || !!parseTicketDateLocal(s), "Invalid date"),
    projectTypeId: z.string().optional(),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((s) => !!parseTicketDateLocal(s), "Invalid start date"),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((s) => !!parseTicketDateLocal(s), "Invalid end date"),
    categoryId: z.string().optional(),
    initiatedById: z.string().optional(),
    departmentalPocId: z.string().optional(),
    partnerIds: z.array(z.string()).optional(),
    projectStatusId: z.string().min(1, "Status is required"),
    projectManagerId: z.string().optional(),
    priorityId: z.string().min(1, "Priority is required"),
    projectAction: z.enum(["hold", "assigned"]).optional(),
    assignToId: z.string().optional(),
    taskTemplateId: z.string().optional(),
    isDraft: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const start = parseTicketDateLocal(data.startDate);
      const end = parseTicketDateLocal(data.endDate);
      if (!start || !end) return true;
      return end >= start;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => data.projectAction !== "assigned" || !!data.assignToId,
    { message: "Choose who to assign when status action is Assigned", path: ["assignToId"] },
  );

export type ProjectFormData = z.infer<typeof projectFormSchema>;

export function projectToFormDefaults(project: Project): ProjectFormData {
  return {
    name: project.name,
    description: project.description,
    projectCode: project.projectCode ?? "",
    brdReceivingDate: isoOrDateToTicketDateLocal(project.brdReceivingDate),
    projectTypeId: project.projectTypeId ?? "",
    startDate: isoOrDateToTicketDateLocal(project.startDate),
    endDate: isoOrDateToTicketDateLocal(project.endDate),
    categoryId: project.categoryId ?? "",
    initiatedById: project.initiatedById ?? "",
    departmentalPocId: project.departmentalPocId ?? "",
    partnerIds: project.partnerIds ?? [],
    projectStatusId: project.projectStatusId ?? "ps-active",
    projectManagerId: project.projectManagerId ?? "",
    priorityId: project.priorityId ?? "pri-medium",
    projectAction: project.projectAction ?? undefined,
    assignToId: project.assignToId ?? "",
    taskTemplateId: project.taskTemplateId ?? "",
    isDraft: project.isDraft ?? false,
  };
}
