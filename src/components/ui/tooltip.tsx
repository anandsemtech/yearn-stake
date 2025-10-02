"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

/** tiny local util (avoid extra deps) */
function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    /** if you want a narrower/wider tooltip, pass className */
  }
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // container
        "z-50 rounded-md border px-3 py-2 text-sm shadow-md select-none",
        // light
        "bg-white border-gray-200 text-gray-800",
        // dark
        "dark:bg-[#0F1720] dark:text-gray-200 dark:border-gray-800",
        // motion / animation
        "data-[state=delayed-open]:data-[side=top]:animate-in data-[state=delayed-open]:data-[side=top]:fade-in-0 data-[state=delayed-open]:data-[side=top]:slide-in-from-bottom-1",
        "data-[state=delayed-open]:data-[side=bottom]:animate-in data-[state=delayed-open]:data-[side=bottom]:fade-in-0 data-[state=delayed-open]:data-[side=bottom]:slide-in-from-top-1",
        "data-[state=delayed-open]:data-[side=left]:animate-in data-[state=delayed-open]:data-[side=left]:fade-in-0 data-[state=delayed-open]:data-[side=left]:slide-in-from-right-1",
        "data-[state=delayed-open]:data-[side=right]:animate-in data-[state=delayed-open]:data-[side=right]:fade-in-0 data-[state=delayed-open]:data-[side=right]:slide-in-from-left-1",
        // optional tweak
        "max-w-xs",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";
