import * as React from "react";
import { cn } from "@/lib/utils";

export function InputGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-white",
        className,
      )}
      {...props}
    />
  );
}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "min-w-0 flex-1 border-0 bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-0",
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

export function InputGroupAddon({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-l border-slate-200 px-2",
        className,
      )}
      {...props}
    />
  );
}
