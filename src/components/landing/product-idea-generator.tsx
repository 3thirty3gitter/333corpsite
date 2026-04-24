"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { SuggestProductInput, SuggestProductOutput } from "@/ai/flows/suggest-product-flow";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Lightbulb, Loader2, Wand2 } from "lucide-react";
import { Balancer } from "react-wrap-balancer";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Please describe your business idea in at least 10 characters.",
  }),
});

export default function ProductIdeaGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestProductOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: SuggestProductInput = { businessDescription: values.description };
      const res = await fetch('/api/ai/suggest-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error('Server error');
      const response = await res.json() as SuggestProductOutput;
      setResult(response);
    } catch (e) {
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <Wand2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <Balancer>Find the Next "Pilot" for Your Business</Balancer>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <Balancer>
              Have a business challenge? Describe it below, and our AI will suggest the next software product in the Pilot Suite to solve it.
            </Balancer>
          </p>
        </div>

        <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}>
          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Bot className="w-5 h-5" />
                          Describe your business need
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'I need a tool to manage customer support tickets and track conversations across email and social media.'"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate Product Name
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {error && (
            <div className="mt-6 text-center text-destructive animate-fade-in-up">
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-8 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-center mb-6 text-foreground">AI-Powered Suggestions</h3>
              <div className="space-y-4">
                {result.suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-secondary/30 border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}>
                    <CardContent className="p-6">
                      <h4 className="text-xl font-bold text-primary mb-2">{suggestion.name}</h4>
                      <p className="text-muted-foreground">{suggestion.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
