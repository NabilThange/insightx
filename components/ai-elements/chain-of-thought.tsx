"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { BrainIcon, ChevronDownIcon, CheckCircle2, Circle } from "lucide-react";
import { createContext, memo, useContext, useMemo } from "react";

interface ChainOfThoughtContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) throw new Error("ChainOfThought components must be used within ChainOfThought");
  return context;
};

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ChainOfThought = memo(
  ({ className, open, defaultOpen = false, onOpenChange, children, ...props }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    const chainOfThoughtContext = useMemo(
      () => ({ isOpen: isOpen ?? false, setIsOpen }),
      [isOpen, setIsOpen]
    );

    return (
      <ChainOfThoughtContext.Provider value={chainOfThoughtContext}>
        <div className={cn("cot-root", className)} {...props}>
          {children}
        </div>
        <style jsx>{`
          .cot-root {
            width: 100%;
            background: var(--bg-elevated);
            border: 1px solid var(--stroke);
            border-radius: 0.75rem;
            overflow: hidden;
            font-family: 'PP Neue Montreal', -apple-system, sans-serif;
          }
        `}</style>
      </ChainOfThoughtContext.Provider>
    );
  }
);

export type ChainOfThoughtHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const ChainOfThoughtHeader = memo(
  ({ className, children, ...props }: ChainOfThoughtHeaderProps) => {
    const { isOpen, setIsOpen } = useChainOfThought();

    return (
      <>
        <Collapsible onOpenChange={setIsOpen} open={isOpen}>
          <CollapsibleTrigger
            className={cn("cot-trigger", className)}
            {...props}
          >
            <div className="cot-trigger-inner">
              <div className="cot-brain-icon">
                <BrainIcon size={14} />
              </div>
              <span className="cot-trigger-label">
                {children ?? "Chain of Thought"}
              </span>
              <ChevronDownIcon
                className={cn("cot-chevron", isOpen ? "cot-chevron-open" : "")}
                size={14}
              />
            </div>
          </CollapsibleTrigger>
        </Collapsible>
        <style jsx>{`
          :global(.cot-trigger) {
            display: block;
            width: 100%;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
          }
          :global(.cot-trigger):hover .cot-trigger-inner {
            background: var(--bg);
          }
          .cot-trigger-inner {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.75rem 1rem;
            transition: background 0.15s;
          }
          .cot-brain-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.5rem;
            height: 1.5rem;
            background: var(--fg);
            color: var(--bg);
            border-radius: 0.375rem;
            flex-shrink: 0;
          }
          .cot-trigger-label {
            flex: 1;
            text-align: left;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--fg);
            letter-spacing: 0.01em;
          }
          .cot-chevron {
            color: var(--text-muted);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            flex-shrink: 0;
          }
          .cot-chevron-open {
            transform: rotate(180deg);
          }
        `}</style>
      </>
    );
  }
);

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
};

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon,
    label,
    description,
    status = "complete",
    children,
    ...props
  }: ChainOfThoughtStepProps) => (
    <>
      <div
        className={cn(
          "cot-step",
          status === "active" && "cot-step-active",
          status === "pending" && "cot-step-pending",
          className
        )}
        {...props}
      >
        <div className="cot-step-icon-col">
          <div className={`cot-step-icon-wrap ${status === "active" ? "cot-icon-active" : status === "pending" ? "cot-icon-pending" : "cot-icon-complete"}`}>
            {Icon ? (
              <Icon size={12} />
            ) : status === "complete" ? (
              <CheckCircle2 size={12} />
            ) : (
              <Circle size={12} />
            )}
          </div>
          <div className="cot-step-line" />
        </div>
        <div className="cot-step-body">
          <div className="cot-step-label">{label}</div>
          {description && (
            <div className="cot-step-desc">{description}</div>
          )}
          {children}
        </div>
      </div>
      <style jsx>{`
        .cot-step {
          display: flex;
          gap: 0.75rem;
          padding: 0.375rem 1rem 0.375rem 1rem;
          animation: cot-step-in 0.25s ease both;
        }

        @keyframes cot-step-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cot-step-active .cot-step-label {
          color: var(--fg);
          font-weight: 500;
        }

        .cot-step-pending .cot-step-label {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .cot-step-icon-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .cot-step-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .cot-icon-complete {
          background: rgba(45, 80, 22, 0.12);
          color: var(--accent-green, #2d5016);
        }

        .cot-icon-active {
          background: rgba(79, 70, 229, 0.12);
          color: var(--accent, #4f46e5);
        }

        .cot-icon-pending {
          background: var(--loader-bg);
          color: var(--text-muted);
        }

        .cot-step-line {
          flex: 1;
          width: 1px;
          background: var(--stroke);
          margin-top: 4px;
          min-height: 16px;
        }

        .cot-step:last-child .cot-step-line {
          display: none;
        }

        .cot-step-body {
          flex: 1;
          padding-bottom: 0.75rem;
          overflow: hidden;
        }

        .cot-step-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.4;
          padding-top: 2px;
        }

        .cot-step-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.7;
          margin-top: 0.25rem;
        }
      `}</style>
    </>
  )
);

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>;

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => {
    const { isOpen } = useChainOfThought();

    return (
      <>
        <Collapsible open={isOpen}>
          <CollapsibleContent
            className={cn("cot-content", className)}
            {...props}
          >
            <div className="cot-content-divider" />
            <div className="cot-steps-wrap">
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
        <style jsx>{`
          :global(.cot-content) {
            overflow: hidden;
          }
          .cot-content-divider {
            height: 1px;
            background: var(--stroke);
            margin: 0 1rem;
          }
          .cot-steps-wrap {
            padding: 0.75rem 0 0.25rem;
          }
        `}</style>
      </>
    );
  }
);

// Legacy exports for compatibility
export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;
export const ChainOfThoughtSearchResults = memo(
  ({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
  )
);

export type ChainOfThoughtSearchResultProps = { className?: string; children?: ReactNode; variant?: string };
export const ChainOfThoughtSearchResult = memo(
  ({ className, children }: ChainOfThoughtSearchResultProps) => (
    <span className={cn("text-xs px-2 py-0.5 rounded-full border border-stroke bg-bg-elevated text-muted font-normal", className)}>
      {children}
    </span>
  )
);

export type ChainOfThoughtImageProps = ComponentProps<"div"> & { caption?: string };
export const ChainOfThoughtImage = memo(
  ({ className, children, caption, ...props }: ChainOfThoughtImageProps) => (
    <div className={cn("mt-2 space-y-2", className)} {...props}>
      <div className="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-bg-elevated p-3">
        {children}
      </div>
      {caption && <p className="text-xs text-muted">{caption}</p>}
    </div>
  )
);

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
