"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  dismissOnOutsidePointerDown: boolean;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within Popover");
  return ctx;
}

export function Popover({
  open: controlledOpen,
  onOpenChange,
  dismissOnOutsidePointerDown = true,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  dismissOnOutsidePointerDown?: boolean;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  return (
    <PopoverContext.Provider
      value={{ open, setOpen, triggerRef, dismissOnOutsidePointerDown }}
    >
      <div className="relative w-full">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const { open, setOpen, triggerRef } = usePopoverContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childRef = child.props.ref as React.Ref<HTMLElement> | undefined;

    return React.cloneElement(child, {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;
        if (typeof childRef === "function") childRef(node);
        else if (childRef && typeof childRef === "object") {
          (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      "aria-expanded": open,
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        const onClick = child.props.onClick as
          | ((e: React.MouseEvent) => void)
          | undefined;
        onClick?.(e);
      },
    } as Record<string, unknown>);
  }

  return (
    <button
      ref={triggerRef as React.Ref<HTMLButtonElement>}
      type="button"
      aria-expanded={open}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  className,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  style,
  onWheel,
  children,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  sideOffset?: number;
  style?: React.CSSProperties;
  onWheel?: (e: React.WheelEvent) => void;
  children: React.ReactNode;
}) {
  const { open, setOpen, triggerRef, dismissOnOutsidePointerDown } =
    usePopoverContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !dismissOnOutsidePointerDown) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, setOpen, triggerRef, dismissOnOutsidePointerDown]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      data-popover-content=""
      className={cn(
        "absolute z-50 rounded-xl border border-slate-200 bg-white text-foreground shadow-lg outline-none",
        side === "bottom" && "top-full",
        side === "top" && "bottom-full",
        align === "start" && "left-0",
        align === "end" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className,
      )}
      style={{
        marginTop: side === "bottom" ? sideOffset : undefined,
        marginBottom: side === "top" ? sideOffset : undefined,
        ...style,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={onWheel}
    >
      {children}
    </div>
  );
}
