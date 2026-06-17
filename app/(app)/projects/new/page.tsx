"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { ProjectForm, type ProjectFormData } from "@/components/projects/project-form";
import { RoleGuard } from "@/components/auth/role-guard";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";

export default function NewProjectPage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      apiClient<Project>(endpoints.projects.list, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (project) => router.push(`/projects/${project.id}/`),
  });

  return (
    <RoleGuard roles={["admin"]} fallback={<p className="p-8 text-destructive">Access denied.</p>}>
      <AppHeader title="New project" />
      <div className="p-6 lg:p-8">
        <ProjectForm
          onSubmit={(data) => mutation.mutate(data)}
          loading={mutation.isPending}
        />
      </div>
    </RoleGuard>
  );
}
