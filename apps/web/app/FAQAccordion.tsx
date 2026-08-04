"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

type FAQItem = {
  question: string;
  answer: string;
};

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <Accordion className="border-t border-border">
      {items.map((item, index) => (
        <AccordionItem
          className="border-b border-border"
          key={item.question}
          value={`faq-${index + 1}`}
        >
          <AccordionTrigger className="min-h-19 py-0 text-[0.92rem] font-[630] text-[var(--site-ink)]">
            <span className="text-pretty">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="max-w-3xl pb-6 pr-14 text-[0.82rem] leading-[1.7] text-muted-foreground">
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
