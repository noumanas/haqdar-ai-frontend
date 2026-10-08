import { Minus, Plus } from "lucide-react";

import { Container, SectionHeading } from "@/components/shared/section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faq } from "@/content/site";

export function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <Container className="grid items-start gap-10 lg:grid-cols-2">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} description={faq.body} />

        <Accordion type="single" collapsible defaultValue="item-0" className="gap-2.5">
          {faq.items.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`} className="overflow-hidden rounded-[22px] border-none bg-white">
              <AccordionTrigger className="group min-h-16 items-center gap-3 rounded-[22px] px-5 text-[17px] font-bold hover:no-underline [&>svg[data-slot=accordion-trigger-icon]]:hidden!">
                {item.q}
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-sand transition-colors group-aria-expanded:bg-ink group-aria-expanded:text-lime">
                  <Plus className="size-4 group-aria-expanded:hidden" aria-hidden />
                  <Minus className="hidden size-4 group-aria-expanded:block" aria-hidden />
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-[15px] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
