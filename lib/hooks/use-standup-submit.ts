"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { StandupEntry } from "@/lib/api/types";
import type { StandupFormData } from "@/components/standup/standup-form";
import { useUiStore } from "@/lib/stores/ui-store";

export function useStandupSubmit() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const standupReturnUrl = useUiStore((s) => s.standupReturnUrl);
  const setStandupReturnUrl = useUiStore((s) => s.setStandupReturnUrl);

  return useMutation({
    mutationFn: (data: StandupFormData) =>
      apiClient<StandupEntry>(endpoints.standup.submit, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["standup"] });
      void queryClient.invalidateQueries({ queryKey: ["standup-history"] });
      void queryClient.invalidateQueries({ queryKey: ["standup-team-today"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (standupReturnUrl) {
        const url = standupReturnUrl;
        setStandupReturnUrl(null);
        router.push(url);
      }
    },
  });
}
