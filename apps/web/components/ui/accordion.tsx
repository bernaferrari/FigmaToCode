"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { PlusIcon } from "lucide-react";
import { cn } from "../../lib/utils";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={className}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-center justify-between gap-4 rounded-lg border border-transparent py-2.5 text-left text-sm font-medium outline-none transition-colors duration-150 focus-visible:border-[var(--site-green-dark)] focus-visible:ring-2 focus-visible:ring-[color:oklch(0.57_0.2_151/18%)] aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <span className="grid size-[1.85rem] shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-[color,background-color,border-color,transform] duration-200 ease-out group-hover/accordion-trigger:border-foreground/20 group-hover/accordion-trigger:bg-foreground/5 group-hover/accordion-trigger:text-foreground group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:border-[color:oklch(0.58_0.16_151/28%)] group-aria-expanded/accordion-trigger:bg-[color:oklch(0.75_0.12_151/15%)] group-aria-expanded/accordion-trigger:text-[var(--site-green-dark)]">
          <PlusIcon className="size-4" strokeWidth={1.7} aria-hidden="true" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden data-closed:animate-accordion-up data-open:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pb-2.5 text-sm data-ending-style:h-0 data-starting-style:h-0",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
