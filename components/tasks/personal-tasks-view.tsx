"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { PersonalTaskListSection } from "@/components/tasks/personal-task-list-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CreatePersonalTaskInput, Task, TaskStatus, User } from "@/lib/api/types";
import { useViewMode } from "@/lib/hooks/use-view-mode";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManagePersonalTasks } from "@/lib/utils/roles";

export function TasksView() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = canManagePersonalTasks(user?.role);
  const [viewMode, setViewMode] = useViewMode("tasks-view-mode");

  const assigneesQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient<User[]>(endpoints.users.list),
    enabled: isAdmin,
  });

  const assignees = assigneesQuery.data?.filter((u) => u.role === "developer") ?? [];

  const miscQuery = useQuery({
    queryKey: ["personal-tasks", "miscellaneous", user?.id],
    queryFn: () => apiClient<Task[]>(endpoints.tasks.personal("miscellaneous")),
    enabled: !!user?.id,
  });

  const routineQuery = useQuery({
    queryKey: ["personal-tasks", "routine", user?.id],
    queryFn: () => apiClient<Task[]>(endpoints.tasks.personal("routine")),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePersonalTaskInput) =>
      apiClient(endpoints.tasks.personal(), {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["personal-tasks", vars.kind] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      apiClient(endpoints.tasks.update(taskId), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const sectionProps = {
    isAdmin,
    assignees,
    onCreate: (data: CreatePersonalTaskInput) => createMutation.mutate(data),
    creating: createMutation.isPending,
    onStatusChange: (id: string, status: TaskStatus) =>
      statusMutation.mutate({ taskId: id, status }),
    currentUserId: user?.id,
    viewMode,
    onViewModeChange: setViewMode,
  };

  return (
    <>
      <AppHeader
        title="Tasks"
        description={
          isAdmin
            ? "Create and assign miscellaneous and routine work outside project boards."
            : "Tasks assigned to you by your Scrum Master."
        }
      />
      <PageContent>
        <Tabs defaultValue="miscellaneous">
          <TabsList>
            <TabsTrigger value="miscellaneous">Miscellaneous</TabsTrigger>
            <TabsTrigger value="routine">Routine</TabsTrigger>
          </TabsList>
          <TabsContent value="miscellaneous">
            <PersonalTaskListSection
              kind="miscellaneous"
              tasks={miscQuery.data}
              loading={miscQuery.isLoading}
              {...sectionProps}
            />
          </TabsContent>
          <TabsContent value="routine">
            <PersonalTaskListSection
              kind="routine"
              tasks={routineQuery.data}
              loading={routineQuery.isLoading}
              {...sectionProps}
            />
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}
