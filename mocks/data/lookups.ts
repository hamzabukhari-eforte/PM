import type { ProjectLookups } from "@/lib/api/types";

export const projectLookups: ProjectLookups = {
  projectTypes: [
    { id: "pt-internal", label: "Internal" },
    { id: "pt-client", label: "Client Delivery" },
    { id: "pt-rnd", label: "R&D" },
  ],
  categories: [
    { id: "cat-software", label: "Software" },
    { id: "cat-infra", label: "Infrastructure" },
    { id: "cat-process", label: "Process Improvement" },
  ],
  priorities: [
    { id: "pri-low", label: "Low" },
    { id: "pri-medium", label: "Medium" },
    { id: "pri-high", label: "High" },
    { id: "pri-critical", label: "Critical" },
  ],
  projectStatuses: [
    { id: "ps-draft", label: "Draft" },
    { id: "ps-hold", label: "On Hold" },
    { id: "ps-active", label: "Active" },
    { id: "ps-closed", label: "Closed" },
  ],
  projectActions: [
    { id: "hold", label: "Hold" },
    { id: "assigned", label: "Assigned" },
  ],
  initiatedBy: [
    { id: "init-dept-a", label: "Department A" },
    { id: "init-dept-b", label: "Department B" },
    { id: "init-exec", label: "Executive Office" },
  ],
  taskStatuses: [
    { id: "ts-unactioned", label: "Un-Actioned" },
    { id: "ts-working", label: "Working On" },
    { id: "ts-hold", label: "On Hold" },
    { id: "ts-complete", label: "Complete" },
    { id: "ts-dependent", label: "Dependent" },
  ],
  completionPercents: Array.from({ length: 11 }, (_, i) => ({
    id: String(i * 10),
    label: `${i * 10}%`,
  })),
  taskTemplates: [
    { id: "tpl-software", label: "Software Delivery Template" },
    { id: "tpl-infra", label: "Infrastructure Rollout" },
  ],
  forms: [
    { id: "form-qa", label: "QA Checklist" },
    { id: "form-deploy", label: "Deployment Sign-off" },
  ],
};

/** POC options per initiating department (legacy cascading load). */
export const departmentalPocs: Record<string, { id: string; label: string }[]> = {
  "init-dept-a": [
    { id: "user-admin", label: "Alex Chen" },
    { id: "user-dev", label: "Dana Developer" },
  ],
  "init-dept-b": [
    { id: "user-dev2", label: "Sam Smith" },
  ],
  "init-exec": [
    { id: "user-admin", label: "Alex Chen" },
  ],
};
