"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "$49",
    pricePeriod: "/month",
    description: "For small teams and startups getting off the ground.",
    features: [
      "Access to 1 Pilot Product",
      "Up to 5 users",
      "Basic analytics",
      "Email support",
    ],
    cta: "Choose Starter",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    pricePeriod: "/month",
    description: "For growing businesses that need more power and scale.",
    features: [
      "Access to all 3 Pilot Products",
      "Up to 20 users",
      "Advanced analytics & reports",
      "Priority email support",
      "API Access",
    ],
    cta: "Choose Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    pricePeriod: "",
    description: "For large organizations with custom needs.",
    features: [
      "Everything in Professional",
      "Unlimited users",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 premium support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-secondary/50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Flexible Pricing for Teams of All Sizes</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose a plan that fits your needs and start streamlining your operations today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col border-2 ${plan.popular ? 'border-primary shadow-primary/20' : 'border-border'} hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 shadow-lg`}
            >
              <CardHeader className="p-6 relative">
                {plan.popular && (
                  <Badge className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="mb-8">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-lg text-muted-foreground">{plan.pricePeriod}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-chart-2 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href={`/checkout?plan=${plan.name}`}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
