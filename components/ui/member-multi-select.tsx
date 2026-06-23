"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatAssigneeNames } from "@/lib/utils/task-assignees";

export function MemberMultiSelect({
  members,
  value,
  onChange,
  placeholder = "Select members…",
  emptyLabel = "Unassigned",
}: {
  members: { userId: string; name: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const selectedNames = value
    .map((id) => members.find((m) => m.userId === id)?.name)
    .filter((name): name is string => !!name);

  function toggle(userId: string) {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
      return;
    }
    onChange([...value, userId]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-10 w-full justify-between px-3 py-2 font-normal"
        >
          <span className={cn("truncate text-left", selectedNames.length === 0 && "text-muted-foreground")}>
            {selectedNames.length > 0 ? formatAssigneeNames(selectedNames) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {members.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No members available</p>
          )}
          {members.map((member) => {
            const checked = value.includes(member.userId);
            return (
              <button
                key={member.userId}
                type="button"
                onClick={() => toggle(member.userId)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100",
                  checked && "bg-indigo-50 text-indigo-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300",
                  )}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
                {member.name}
              </button>
            );
          })}
        </div>
        {value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-muted-foreground"
            onClick={() => onChange([])}
          >
            Clear ({emptyLabel})
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
