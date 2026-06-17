"use client";

import type { ProjectMember } from "@/lib/api/types";
import { assignableRoles, roleLabel } from "@/lib/utils/roles";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MemberList({
  members,
  canEdit,
  onRoleChange,
}: {
  members: ProjectMember[];
  canEdit: boolean;
  onRoleChange: (userId: string, role: ProjectMember["role"]) => void;
}) {
  return (
    <div className="divide-y rounded-xl border">
      {members.map((member) => (
        <div key={member.userId} className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          {canEdit ? (
            <Select
              value={member.role}
              onValueChange={(role) =>
                onRoleChange(member.userId, role as ProjectMember["role"])
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="secondary">{roleLabel(member.role)}</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
