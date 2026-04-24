'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, FileText, User, MessageCircle, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, BookOpen, Target, Users, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Scenario {
  title: string;
  outcome: string;
  type: string;
  category: string;
  description: string;
  dialogue: Array<{ role: string; text: string; color?: string }>;
}

const SCENARIOS: Scenario[] = [
  // Sales & Upselling Category
  {
    title: "The Successful Upsell",
    outcome: "Success",
    type: "Email/Phone",
    category: "Sales & Upselling",
    description: "Client orders basic business cards, but their brand suggests a premium finish would be better.",
    dialogue: [
      { role: "Employee", text: "Hi Sarah! I've received your order for the standard business cards. Looking at your logo's metallic elements, have you considered our Silk Matte finish with Spot UV? It really makes those gold tones pop." },
      { role: "Client", text: "Oh, I didn't know that was an option! Is it much more expensive?" },
      { role: "Employee", text: "It's a small upgrade, but for a first impression, it's a game-changer. I've applied a 10% 'First-Time Premium' discount to your quote if you'd like to see the difference!" },
      { role: "Outcome", text: "Client upgraded to premium cards and signed up for a monthly recurring flyer order.", color: "text-green-600" }
    ]
  },
  {
    title: "Proactive Re-order",
    outcome: "Revenue Retention",
    type: "Outbound Call",
    category: "Sales & Upselling",
    description: "Calling a client who hasn't ordered their monthly flyers in 5 weeks.",
    dialogue: [
      { role: "Employee", text: "Hi Mike! It's [Name] from 3thirty3. I was looking through our logs and noticed it's been about five weeks since your last flyer run. I wanted to catch you before you ran out!" },
      { role: "Client", text: "Oh man, thanks for the reminder! We actually only have about 20 left. Can we just do the exact same order as last time?" },
      { role: "Employee", text: "You bet. I've already pulled the file. Since we're re-running it, I can have them ready for you by tomorrow afternoon. I'll send the invoice over now!" },
      { role: "Outcome", text: "Prevented a competitor from stepping in and simplified the client's day before they hit a crisis.", color: "text-blue-500" }
    ]
  },
  {
    title: "Bundle Opportunity",
    outcome: "Success",
    type: "Email",
    category: "Sales & Upselling",
    description: "Client orders letterhead but hasn't considered matching envelopes and business cards.",
    dialogue: [
      { role: "Employee", text: "Hi Alex! Your letterhead order looks fantastic. I noticed you didn't include matching envelopes or business cards. We have a 'Brand Bundle' that gives you 15% off when you order all three together." },
      { role: "Client", text: "I was planning to do those later, but if there's a discount..." },
      { role: "Employee", text: "Absolutely! Plus, ordering them together ensures perfect color matching across all your stationery. I can add them to this order now and lock in your pricing." },
      { role: "Outcome", text: "Increased order value by 280% and ensured brand consistency for the client.", color: "text-green-600" }
    ]
  },
  {
    title: "Volume Discount Introduction",
    outcome: "Success",
    type: "Phone Call",
    category: "Sales & Upselling",
    description: "Repeat customer orders 250 postcards monthly; suggest larger quantity for savings.",
    dialogue: [
      { role: "Employee", text: "Hey Jennifer! I was reviewing your account and noticed you order 250 postcards every 3-4 weeks. If you bumped up to 500 per order, you'd save about $40 per batch." },
      { role: "Client", text: "But I don't want to be stuck with extras if we don't use them all." },
      { role: "Employee", text: "Totally understand. Based on your frequency, you'd use them within 8 weeks. And at the rate you're growing, you might even run out sooner! We can also store the extras for you if space is tight." },
      { role: "Outcome", text: "Client switched to quarterly bulk orders, increasing lifetime value and reducing per-unit costs.", color: "text-green-600" }
    ]
  },

  // Crisis Management Category
  {
    title: "Handling a Production Delay",
    outcome: "Critical",
    type: "Proactive Outbound",
    category: "Crisis Management",
    description: "A machine breakdown means a high-priority banner order will be 24 hours late.",
    dialogue: [
      { role: "Employee", text: "Good morning Mark. I'm calling from 3thirty3 with an update on your event banner. We've had a minor mechanical issue this morning which has delayed production by one day." },
      { role: "Client", text: "I need that banner for a trade show tomorrow afternoon! This is a big problem." },
      { role: "Employee", text: "I completely understand the urgency. I've already cleared our schedule to run your job first thing tonight. I will personally hand-deliver it to your office by 9 AM tomorrow, and we've waived the shipping fee." },
      { role: "Outcome", text: "Client appreciated the honesty and the personal delivery, maintaining the long-term relationship.", color: "text-blue-600" }
    ]
  },
  {
    title: "The 'Difficult' Customer",
    outcome: "De-escalated",
    type: "Phone Call",
    category: "Crisis Management",
    description: "Client is angry about a previous order's color mismatch.",
    dialogue: [
      { role: "Client", text: "The blue on these brochures is completely wrong! I can't believe I paid $500 for this trash." },
      { role: "Employee", text: "I am so sorry to hear that, David. I can hear how frustrating this is, especially with your event coming up. Let's look at the press sheet together—I want to make this right." },
      { role: "Employee", text: "I've checked our calibration logs. I'm going to re-run the entire batch now with a custom color profile at no cost to you, and I'll include 100 extra copies for the trouble." },
      { role: "Outcome", text: "Customer's anger subsided. They became a loyal advocate after we 'owned' the mistake.", color: "text-red-600" }
    ]
  },
  {
    title: "The 'Need it Yesterday' Rush",
    outcome: "Heroic Effort",
    type: "Phone/Walk-in",
    category: "Crisis Management",
    description: "Client forgot to order programs for a funeral/memorial service tomorrow morning.",
    dialogue: [
      { role: "Client", text: "I'm so sorry, I completely forgot the programs. Is there any way to get 200 copies by 8 AM? I know it's late." },
      { role: "Employee", text: "First, please accept our condolences. We understand how important this is. If you can get us the final file in the next 30 minutes, I will keep the press open late tonight myself." },
      { role: "Employee", text: "We'll have them boxed and ready for you at our side entrance by 7:30 AM. Don't worry about the rush fee—we're just happy to help out." },
      { role: "Outcome", text: "Client was moved to tears by the empathy and reliability during a difficult time.", color: "text-purple-600" }
    ]
  },
  {
    title: "Missing Deadline Recovery",
    outcome: "Critical",
    type: "Proactive Outbound",
    category: "Crisis Management",
    description: "Print shop realizes they quoted the wrong turnaround time; event is in 2 days.",
    dialogue: [
      { role: "Employee", text: "Hi Sandra, this is [Name] from 3thirty3. I need to be upfront with you—I made an error on your wedding program timeline. I quoted 5 days, but our current queue is actually 7 days out." },
      { role: "Client", text: "What? The wedding is Saturday! This is a disaster." },
      { role: "Employee", text: "I completely own this mistake. Here's what I've done: I've already contacted two partner shops. One can run it overnight with our exact paper and finish. I'll cover the rush charge, and I'm personally driving it to your venue Friday morning." },
      { role: "Outcome", text: "Client initially furious but impressed by accountability and solution. Left a 5-star review mentioning 'mistakes happen, but they really stepped up.'", color: "text-red-600" }
    ]
  },

  // Technical Education Category
  {
    title: "The 'File Not Ready' Resolution",
    outcome: "Supportive",
    type: "SMS/Email",
    category: "Technical Education",
    description: "Client sent a low-resolution JPG for a 48-inch poster.",
    dialogue: [
      { role: "Employee", text: "Hi Jamie! We're excited to print your poster. I noticed the file sent is a bit low-res for that size. Do you happen to have the original PDF or 'Vector' file? We want this to look sharp for you!" },
      { role: "Client", text: "I'm not sure what a vector is. That's the only file my designer gave me." },
      { role: "Employee", text: "No worries at all! If you can send me your designer's email, I can reach out to them directly to grab the right format so you don't have to worry about the technical side." },
      { role: "Outcome", text: "Client felt supported rather than frustrated by technical jargon. Print quality was perfect.", color: "text-orange-600" }
    ]
  },
  {
    title: "Explaining CMYK vs RGB",
    outcome: "Educational",
    type: "Email",
    category: "Technical Education",
    description: "Client is confused why their neon green logo looks 'dull' in the proof.",
    dialogue: [
      { role: "Client", text: "The proof looks dark. On my phone it's neon, but here it looks like grass green. Can you fix it?" },
      { role: "Employee", text: "I see exactly what you mean! Phones use light (RGB) to make colors, while our presses use ink (CMYK). Some 'neon' colors are physically impossible to print with standard ink." },
      { role: "Employee", text: "To get closer to that 'pop,' I recommend switching to a Fluorescent Spot Ink. It's a special process, but it's the only way to match that vibrance. Shall I send a revised quote?" },
      { role: "Outcome", text: "Client understood the technical limitation and felt the employee was a 'Printing Expert' rather than just an order-taker.", color: "text-emerald-600" }
    ]
  },
  {
    title: "Bleed and Trim Explained",
    outcome: "Educational",
    type: "Email",
    category: "Technical Education",
    description: "Client's design has text too close to the edge; needs to understand bleed area.",
    dialogue: [
      { role: "Employee", text: "Hi Chris! Your design looks great, but I noticed your phone number is only 0.05 inches from the edge. When we cut the cards, there's a tiny bit of variance, and we don't want to risk trimming off any text!" },
      { role: "Client", text: "I made it 8.5x11 exactly. Isn't that the size?" },
      { role: "Employee", text: "It is! But we need a 'safety zone' of about 0.125 inches from each edge. Think of it like the margins in a Word doc. I can nudge your elements inward slightly, or send you a template with guides—whichever is easier!" },
      { role: "Outcome", text: "Client appreciated the proactive catch and learned about print-safe design zones.", color: "text-orange-600" }
    ]
  },
  {
    title: "Paper Weight Consultation",
    outcome: "Educational",
    type: "Phone Call",
    category: "Technical Education",
    description: "Client doesn't understand difference between 14pt and 16pt cardstock.",
    dialogue: [
      { role: "Client", text: "What's the difference between the 14 point and 16 point? Is it noticeable?" },
      { role: "Employee", text: "Great question! Think of 14pt like a standard credit card—sturdy and professional. 16pt is more like a hotel key card—thicker and feels more premium. For business cards, most go with 14pt unless they want that 'luxury brand' feel." },
      { role: "Employee", text: "I can mail you sample packs of both if you want to feel them in person before deciding!" },
      { role: "Outcome", text: "Client chose 14pt but saved samples for future premium client projects. Felt confident in decision.", color: "text-orange-600" }
    ]
  },

  // Community & Relationships Category
  {
    title: "The Non-Profit Request",
    outcome: "Community Partnership",
    type: "Phone Call",
    category: "Community & Relationships",
    description: "Local charity asks for free printing for their annual fundraiser.",
    dialogue: [
      { role: "Client", text: "We're a small non-profit. Does 3thirty3 ever sponsor events or donate printing services?" },
      { role: "Employee", text: "We love supporting the local community! While we can't always do 'free,' we have a dedicated Non-Profit Program. We offer a permanent 25% discount for all 501(c)(3) organizations." },
      { role: "Employee", text: "Additionally, if you include our logo on the back of the programs as a 'Print Sponsor,' I can likely get you an extra 10% off through our marketing budget. How does that sound?" },
      { role: "Outcome", text: "Secured a new long-term account and gained local brand visibility through sponsorship.", color: "text-amber-600" }
    ]
  },
  {
    title: "The Local Business Referral",
    outcome: "Community Partnership",
    type: "Walk-in",
    category: "Community & Relationships",
    description: "Bakery owner needs menus but also mentions their neighbor needs signage.",
    dialogue: [
      { role: "Client", text: "These menus are perfect, thanks! By the way, the salon next door asked me who does my printing." },
      { role: "Employee", text: "That's awesome to hear! If you text me their info, I'll send them a 'Friend of [Client]' discount code. And as a thank-you, we'll give you 10% off your next order too!" },
      { role: "Outcome", text: "Gained new client through referral and strengthened loyalty with existing client. Referral became a recurring customer.", color: "text-amber-600" }
    ]
  },
  {
    title: "Supporting a Student Project",
    outcome: "Community Partnership",
    type: "Email",
    category: "Community & Relationships",
    description: "College student needs 50 posters for a campus event but has a very limited budget.",
    dialogue: [
      { role: "Client", text: "I'm a student organizing a campus mental health awareness event. We only have $75 to spend on posters. Is that enough?" },
      { role: "Employee", text: "That's an incredible cause! For student/community events like this, we have a special pricing tier. I can get you 50 posters on quality stock for $70, and I'll throw in 100 flyers for free to help spread the word." },
      { role: "Client", text: "Wow, really? That would be amazing!" },
      { role: "Outcome", text: "Student posted about the kindness on social media, generating significant local awareness. Long-term brand loyalty created.", color: "text-amber-600" }
    ]
  },

  // Quality Assurance Category
  {
    title: "Catching a Client's Typo",
    outcome: "Preventative",
    type: "Email",
    category: "Quality Assurance",
    description: "Employee spots a misspelled phone number before printing 5,000 flyers.",
    dialogue: [
      { role: "Employee", text: "Hi Rachel! Your flyer design looks great, but I wanted to double-check—is your phone number 555-0178 or 555-0187? The file shows 0187, but your website shows 0178." },
      { role: "Client", text: "Oh my god, you just saved me! It's 0178. I can't believe I missed that!" },
      { role: "Employee", text: "No worries at all—that's what we're here for! I'll update the file and send you a new proof before we print. Crisis averted!" },
      { role: "Outcome", text: "Client avoided printing 5,000 unusable flyers. Became a vocal advocate for 3thirty3's attention to detail.", color: "text-blue-600" }
    ]
  },
  {
    title: "Color Consistency Check",
    outcome: "Preventative",
    type: "Phone Call",
    category: "Quality Assurance",
    description: "Client re-orders business cards but new file has slightly different logo color.",
    dialogue: [
      { role: "Employee", text: "Hey Tom, quick question on your business card re-order. The logo blue in this file is slightly different than your last batch. Do you want to match the original, or is this a brand update?" },
      { role: "Client", text: "No, it should match! My assistant must have used an old file. Can you use the color from the last order?" },
      { role: "Employee", text: "Absolutely! I'll pull the specs from your previous job and make sure it's a perfect match. You'll have a proof in 20 minutes." },
      { role: "Outcome", text: "Prevented brand inconsistency and demonstrated that 3thirty3 maintains detailed client records.", color: "text-blue-600" }
    ]
  },
  {
    title: "Proof Rejection - Right Call",
    outcome: "Preventative",
    type: "Email",
    category: "Quality Assurance",
    description: "Client approves proof, but employee notices a critical error client missed.",
    dialogue: [
      { role: "Employee", text: "Hi Maria! I know you approved the proof, but I noticed the event date says 'March 32nd' which doesn't exist. I'm guessing it should be April 1st? I wanted to catch it before we print 500 invitations!" },
      { role: "Client", text: "OH NO! Yes, it's April 1st. Thank you so much for catching that—I was looking at the design, not the details!" },
      { role: "Employee", text: "Exactly why we do a final quality check! I'll fix it and send you an updated proof. Better safe than sorry!" },
      { role: "Outcome", text: "Client avoided a complete reprint. Told story at a networking event, generating three new referrals.", color: "text-blue-600" }
    ]
  }
];

const CATEGORY_CONFIG = [
  { 
    name: "Sales & Upselling", 
    icon: TrendingUp, 
    color: "text-green-600",
    description: "Revenue growth through value-added suggestions"
  },
  { 
    name: "Crisis Management", 
    icon: AlertTriangle, 
    color: "text-red-600",
    description: "Handling delays, complaints, and urgent situations"
  },
  { 
    name: "Technical Education", 
    icon: BookOpen, 
    color: "text-orange-600",
    description: "Explaining print concepts in client-friendly terms"
  },
  { 
    name: "Community & Relationships", 
    icon: Heart, 
    color: "text-amber-600",
    description: "Building local partnerships and long-term loyalty"
  },
  { 
    name: "Quality Assurance", 
    icon: Target, 
    color: "text-blue-600",
    description: "Proactive error-catching and attention to detail"
  }
];

export function ConversationScenarios() {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getScenariosByCategory = (categoryName: string) => {
    return SCENARIOS.filter(scenario => scenario.category === categoryName);
  };

  return (
    <Card className="shadow-md h-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="border-b bg-muted/30 cursor-pointer select-none">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Scenario Training</CardTitle>
                  <CardDescription>Real-world examples of the 3thirty3 voice in action ({SCENARIOS.length} scenarios)</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-6 space-y-4">
            {CATEGORY_CONFIG.map((category) => {
              const CategoryIcon = category.icon;
              const scenariosInCategory = getScenariosByCategory(category.name);
              const isCategoryOpen = openCategories[category.name] || false;
              
              return (
                <div key={category.name} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-sm">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {scenariosInCategory.length} scenario{scenariosInCategory.length !== 1 ? 's' : ''}
                      </Badge>
                      {isCategoryOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {isCategoryOpen && (
                    <div className="p-4 space-y-6 bg-background">
                      {scenariosInCategory.map((scenario, index) => (
                        <div key={index} className="relative pl-6 border-l-2 border-muted hover:border-primary/40 transition-colors">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-muted" />
                          
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-bold text-base">{scenario.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-[10px] uppercase">{scenario.type}</Badge>
                              <Badge 
                                variant={
                                  scenario.outcome === 'Success' || scenario.outcome === 'Revenue Retention' ? 'default' : 
                                  scenario.outcome === 'Critical' ? 'destructive' : 
                                  'outline'
                                }
                                className="text-[10px] uppercase"
                              >
                                {scenario.outcome}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            {scenario.description}
                          </p>

                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            {scenario.dialogue.map((line, i) => (
                              <div key={i} className="text-sm">
                                {line.role === 'Outcome' ? (
                                  <div className={`mt-2 pt-2 border-t flex items-start gap-2 font-medium ${line.color}`}>
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{line.text}</span>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <span className="font-bold min-w-[70px] text-primary/70">{line.role}:</span>
                                    <span className="text-foreground/90 italic">"{line.text}"</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
