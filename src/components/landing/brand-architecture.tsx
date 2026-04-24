"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Printer,
  StickyNote,
  Clock,
  Plus,
} from "lucide-react";
import { Balancer } from "react-wrap-balancer";

const products = [
  {
    name: "PrintPilot",
    title: "Print Management Simplified",
    icon: Printer,
    color: "bg-primary text-primary-foreground",
  },
  {
    name: "StickerPilot",
    title: "Stickers at Scale, Done Right",
    icon: StickyNote,
    color: "bg-chart-2 text-white",
  },
  {
    name: "TimePilot",
    title: "Smarter Time Tracking",
    icon: Clock,
    color: "bg-chart-3 text-white",
  },
];

export function BrandArchitecture() {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <Balancer>Our Brand Architecture</Balancer>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <Balancer>
              A clear, professional structure that protects your business and scales with your vision.
            </Balancer>
          </p>
        </div>

        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="bg-secondary/50 rounded-2xl p-4 sm:p-8 border">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground font-bold text-sm flex-shrink-0 border">1</div>
                    <div>
                      <div className="font-bold text-lg text-foreground">3Thirty3 Holdings Ltd.</div>
                      <div className="text-muted-foreground text-sm">Parent umbrella company</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-12">
                   <Accordion type="multiple" defaultValue={['sub-item-2']} className="w-full border-l-2 border-border pl-6 space-y-4">
                      <AccordionItem value="sub-item-1" className="border-b-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                          <div className="flex items-center gap-4">
                            <div className="w-6 h-6 bg-blue-500/50 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">A</div>
                            <div>
                              <div className="font-semibold text-foreground">3Thirty3 Ltd.</div>
                              <div className="text-muted-foreground text-sm">Printing & merchandise business</div>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </AccordionItem>
                      <AccordionItem value="sub-item-2" className="border-b-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                           <div className="flex items-center gap-4">
                            <div className="w-6 h-6 bg-purple-500/50 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">B</div>
                            <div>
                              <div className="font-semibold text-foreground">3Thirty3 Solutions Ltd.</div>
                              <div className="text-muted-foreground text-sm">Software & SaaS company</div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-3 pl-10">
                          <div className="border-l-2 border-purple-500/30 pl-6 space-y-3">
                            {products.map((product, index) => (
                              <div key={index} className="flex items-center">
                                <div className={`w-6 h-6 rounded-full ${product.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                  <product.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium text-foreground">{product.name}</div>
                                  <div className="text-muted-foreground text-sm">{product.title}</div>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center text-muted-foreground">
                              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-bold flex-shrink-0 border">
                                <Plus className="w-3.5 h-3.5" />
                              </div>
                              <div className="ml-3 text-sm">Future "Pilot" products</div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandArchitecture;
