"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { ProjectForm, type ProjectFormData } from "@/components/projects/project-form";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CreateProjectInput, Project } from "@/lib/api/types";
import { ticketDateLocalToIsoDate } from "@/lib/utils/ticket-datetime";
import { useUiStore } from "@/lib/stores/ui-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

function toCreateInput(data: ProjectFormData): CreateProjectInput {
  return {
    name: data.name,
    description: data.description ?? "",
    projectCode: data.projectCode || null,
    brdReceivingDate: data.brdReceivingDate
      ? ticketDateLocalToIsoDate(data.brdReceivingDate)
      : null,
    projectTypeId: data.projectTypeId || null,
    startDate: ticketDateLocalToIsoDate(data.startDate),
    endDate: ticketDateLocalToIsoDate(data.endDate),
    categoryId: data.categoryId || null,
    initiatedById: data.initiatedById || null,
    departmentalPocId: data.departmentalPocId || null,
    partnerIds: data.partnerIds ?? [],
    projectStatusId: data.projectStatusId || null,
    projectManagerId: data.projectManagerId || null,
    priorityId: data.priorityId || null,
    projectAction: data.projectAction ?? null,
    assignToId: data.assignToId || null,
    taskTemplateId: data.taskTemplateId || null,
    isDraft: data.isDraft ?? false,
  };
}

export default function NewProjectPage() {
  const router = useRouter();
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      apiClient<Project>(endpoints.projects.list, {
        method: "POST",
        body: JSON.stringify(toCreateInput(data)),
      }),
    onSuccess: (project) => {
      setActiveProjectId(project.id);
      router.push(SCREEN_PATHS.project);
    },
  });

  const draftMutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      apiClient<Project>(endpoints.projects.list, {
        method: "POST",
        body: JSON.stringify({ ...toCreateInput(data), isDraft: true }),
      }),
    onSuccess: (project) => {
      setActiveProjectId(project.id);
      router.push(SCREEN_PATHS.project);
    },
  });

  return (
    <RoleGuard roles={["admin"]} fallback={<p className="p-8 text-destructive">Access denied.</p>}>
      <AppHeader
        title="Create project"
        description="Add the basics now — fill in advanced details later if you need them."
        actions={
          <Button variant="outline" asChild>
            <Link href={SCREEN_PATHS.projects}>Cancel</Link>
          </Button>
        }
      />
      <PageContent width="form">
        <ProjectForm
          mode="create"
          onSubmit={(data) => mutation.mutate(data)}
          onSaveDraft={(data) => draftMutation.mutate(data)}
          onCancel={() => router.push(SCREEN_PATHS.projects)}
          loading={mutation.isPending || draftMutation.isPending}
          submitLabel="Create project"
        />
      </PageContent>
    </RoleGuard>
  );
}
