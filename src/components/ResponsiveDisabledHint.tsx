import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  reason?: string | null;
  disabled: boolean;
  children: React.ReactNode;   // usually your <button>
  className?: string;
  // optional positioning overrides (useful if needed)
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

function useIsTouchLike() {
  const [isTouchLike, setIsTouchLike] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none)");
    const handle = () => setIsTouchLike(!!mq.matches);
    handle();
    mq.addEventListener?.("change", handle);
    return () => mq.removeEventListener?.("change", handle);
  }, []);

  return isTouchLike;
}

export default function ResponsiveDisabledHint({
  reason,
  disabled,
  children,
  className,
  side = "top",
  align = "start",
}: Props) {
  const isTouchLike = useIsTouchLike();

  // If not disabled or no reason, just render children (unchanged)
  if (!disabled || !reason) {
    return <span className={className}>{children}</span>;
  }

  // Ensure the *child element* (typically a <button disabled>) won’t eat hover/tap,
  // so the wrapper trigger gets it and can show the tooltip/popover.
  // We auto-inject `pointer-events-none` into the child's className when disabled.
  let child = children;
  if (React.isValidElement(children)) {
    const existing = (children.props as any).className || "";
    const patchedClass = `${existing} pointer-events-none`.trim();
    child = React.cloneElement(children as React.ReactElement, {
      className: patchedClass,
    });
  }

  if (isTouchLike) {
    // Mobile/touch → tap to reveal reason
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span
            className={className}
            role="button"
            tabIndex={0}
            aria-label={typeof reason === "string" ? reason : undefined}
          >
            {child}
          </span>
        </PopoverTrigger>
        <PopoverContent side={side} align={align} className="max-w-xs text-sm">
          {reason}
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop/hover → tooltip on hover/focus
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{child}</span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs text-sm">
          {reason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
