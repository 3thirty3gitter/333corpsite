'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, Heart, Star, Send, PhoneCall, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CommunicationRulesCard() {
  return (
    <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-primary/5 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              Mandatory Communication Rules
            </CardTitle>
            <CardDescription className="text-base font-medium text-primary/80">
              3thirty3 Printing: Creating Welcoming Conversations
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-white border-primary/30 text-primary font-bold px-3 py-1">
            Required Standard
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 gap-6 px-6">
            <TabsTrigger 
              value="email" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-2 pt-2 pb-3 font-semibold transition-none shadow-none"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger 
              value="sms" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-2 pt-2 pb-3 font-semibold transition-none shadow-none"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger 
              value="phone" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-2 pt-2 pb-3 font-semibold transition-none shadow-none"
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </TabsTrigger>
          </TabsList>

          {/* Email Rules */}
          <TabsContent value="email" className="p-6 focus-visible:ring-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Info className="w-4 h-4" />
                  General Guidelines
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Always use a clear, professional subject line including the Order #.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Response time guarantee: Under 2 hours during business hours.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Use the client's name in the greeting—never "Hi there".
                  </li>
                </ul>
              </div>
              <div className="space-y-4 bg-secondary/30 p-4 rounded-lg border">
                <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Send className="w-3 h-3" />
                  Sample Greeting
                </div>
                <div className="text-sm italic text-muted-foreground leading-relaxed">
                  "Hi [Name], thank you for reaching out to 3thirty3 Printing! We're excited to help you with your project. I've reviewed your files and..."
                </div>
                <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground mt-4 block">
                  Closing
                </div>
                <div className="text-sm italic text-muted-foreground leading-relaxed">
                  "Best regards, [Your Name] | 3thirty3 Printing Team"
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SMS Rules */}
          <TabsContent value="sms" className="p-6 focus-visible:ring-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Info className="w-4 h-4" />
                  SMS Etiquette
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Identify yourself and 3thirty3 in the first message.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Keep it concise but friendly. Avoid excessive emojis.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Only send between 9 AM and 6 PM local time.
                  </li>
                </ul>
              </div>
              <div className="space-y-4 bg-secondary/30 p-4 rounded-lg border">
                <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Example Routine Update</div>
                <div className="text-sm italic text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-3">
                  "Hi [Name], it's [Your Name] from 3thirty3 Printing. Just a quick update: your proof is ready for review! Check your email when you have a moment. Thanks!"
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Phone Rules */}
          <TabsContent value="phone" className="p-6 focus-visible:ring-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Info className="w-4 h-4" />
                  The "Friendly Voice" Protocol
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Answer within 3 rings with a smile—it changes your tone!
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    If you must place a client on hold, ask permission first.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    Summarize next steps before hanging up.
                  </li>
                </ul>
              </div>
              <div className="space-y-4 bg-secondary/30 p-4 rounded-lg border">
                <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <PhoneCall className="w-3 h-3" />
                  Mandatory Greeting
                </div>
                <div className="text-sm italic text-muted-foreground leading-relaxed">
                  "Thanks for calling 3thirty3 Printing, where your projects come to life! This is [Your Name], how can I make your day better?"
                </div>
                <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground mt-4 block">
                  Closing
                </div>
                <div className="text-sm italic text-muted-foreground leading-relaxed">
                  "It was a pleasure speaking with you, [Name]. We'll have that estimate over shortly. Have a great rest of your day!"
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="bg-primary/5 p-4 flex items-center gap-3 text-xs text-primary/70 border-t">
          <Heart className="w-4 h-4 fill-primary/20" />
          Note: Every interaction is an opportunity to build trust. Let's keep the 3thirty3 vibe helpful and positive.
        </div>
      </CardContent>
    </Card>
  );
}
