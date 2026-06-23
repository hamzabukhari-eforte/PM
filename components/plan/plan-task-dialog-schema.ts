import { z } from "zod";

export const planTaskDialogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  isDependent: z.boolean().optional(),
  dependentTaskCode: z.string().optional(),
  isMilestone: z.boolean().optional(),
  milestoneNo: z.string().optional(),
  milestoneDescription: z.string().optional(),
});

export type PlanTaskDialogFormData = z.infer<typeof planTaskDialogSchema>;
