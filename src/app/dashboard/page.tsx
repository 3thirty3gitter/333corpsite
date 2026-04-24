'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, StickyNote, Clock, ArrowRight, Megaphone, Archive, BookOpen, GraduationCap, FileText, ExternalLink, Plus, Loader2, Search, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { useToast } from "@/hooks/use-toast";
import { useEmployeeRole } from "@/hooks/use-employee-role";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { CommunicationRulesCard } from "@/components/dashboard/communication-rules";
import { ConversationScenarios } from "@/components/dashboard/conversation-scenarios";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const resourceCards = [
  {
    name: "Knowledge Base",
    description: "Search FAQs, guides, and troubleshooting articles for quick answers.",
    icon: <BookOpen className="w-6 h-6 text-blue-500" />,
    href: "/dashboard/knowledge-base",
    badge: "50+ Articles"
  },
  {
    name: "Training Center",
    description: "Access courses, track certifications, and complete onboarding modules.",
    icon: <GraduationCap className="w-6 h-6 text-green-500" />,
    href: "/dashboard/training",
    badge: "3 New"
  },
  {
    name: "Company Docs",
    description: "View policies, handbooks, forms, and downloadable templates.",
    icon: <FileText className="w-6 h-6 text-purple-500" />,
    href: "/dashboard/documents",
    badge: null
  },
  {
    name: "Quick Links",
    description: "Access external tools, apps, and frequently used resources.",
    icon: <ExternalLink className="w-6 h-6 text-orange-500" />,
    href: "/dashboard/quick-links",
    badge: null
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [tools, setTools] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { isAdmin, loading: roleLoading } = useEmployeeRole();

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('/api/supabase/quick-links');
        const data = await res.json();
        if (data.success) {
          setQuickLinks(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch links:', error);
      } finally {
        setLoadingLinks(false);
      }
    }
    fetchLinks();
  }, []);

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch('/api/supabase/tools');
        const data = await res.json();
        if (data.success) {
          setTools(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      } finally {
        setLoadingTools(false);
      }
    }
    fetchTools();
  }, []);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/supabase/announcements');
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const renderIcon = (icon: string, size: string = "w-8 h-8") => {
    if (!icon) return <span className="text-2xl">🔗</span>;
    
    if (icon.startsWith('http')) {
      return <img src={icon} alt="icon" className={`${size} object-contain`} />;
    }
    
    if (icon.startsWith('lucide:')) {
        return <DynamicIcon name={icon.replace('lucide:', '')} className={size} />;
    }
    
    return <span className="text-2xl">{icon}</span>;
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
        <p className="text-muted-foreground">Your comprehensive portal for tools, training, and company resources.</p>
      </div>

      {/* Quick Search Widget */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-muted-foreground">Google Search</span>
          </div>
          <form onSubmit={handleQuickSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search Google from your dashboard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-secondary hover:border-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <Button type="submit" disabled={!searchQuery.trim()} className="min-w-[100px]">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline"
              asChild
              className="hover:border-primary/50 transition-colors"
            >
              <Link href="/dashboard/search">
                <Globe className="w-4 h-4 mr-2" />
                Open Search
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <CommunicationRulesCard />
        <ConversationScenarios />
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access your most used tools</CardDescription>
          </div>
          {isAdmin && (
            <Button asChild size="sm">
              <Link href="/dashboard/quick-links">
                <Plus className="mr-2 h-4 w-4" />
                Manage Links
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-4">
            {loadingLinks ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickLinks.slice(0, 7).map((link) => (
                        <Button key={link.id} variant="outline" className="h-24 flex flex-col gap-2" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {renderIcon(link.icon)}
                                <span className="text-xs truncate w-full text-center">{link.title}</span>
                            </a>
                        </Button>
                    ))}
                    {isAdmin && (
                        <Button variant="ghost" className="h-24 flex flex-col gap-2 border-dashed border-2" asChild>
                            <Link href="/dashboard/quick-links">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Add New</span>
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </CardContent>
      </Card>

      {/* Quick Access Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Quick Access Tools</h2>
          {isAdmin && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard/tools">Manage Tools <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          )}
        </div>
        {loadingTools ? (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : tools.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No tools configured. Click "Manage Tools" to add one.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
                <Card key={tool.id} className="flex flex-col hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-primary/10">
                <CardHeader className="flex-row items-start gap-4 space-y-0">
                    <div className="bg-secondary p-3 rounded-lg border">
                        {renderIcon(tool.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{tool.title}</CardTitle>
                        <CardDescription className="mt-1 text-sm line-clamp-2">{tool.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Button asChild className="w-full mt-4">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                        {tool.cta_text || "Launch Tool"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                    </Button>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </div>

      {/* Resources & Learning */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Resources & Learning</h2>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/resources">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {resourceCards.map((resource) => (
            <Card key={resource.name} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="bg-secondary p-2 rounded-lg border">
                    {resource.icon}
                  </div>
                  {resource.badge && (
                    <Badge variant="secondary" className="text-xs">{resource.badge}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{resource.name}</CardTitle>
                <CardDescription className="text-sm">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href={resource.href}>
                    Access <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Company Announcements</h2>
            {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/announcements">Manage <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            )}
        </div>
         <Card>
            <CardContent className="p-6 space-y-6">
                {loadingAnnouncements ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground">No current announcements.</p>
                    </div>
                ) : (
                    announcements.map((announcement, index) => (
                        <div key={announcement.id || index} className={`flex items-start gap-4 ${index < announcements.length - 1 ? 'pb-6 border-b' : ''}`}>
                            <div className="bg-secondary p-3 rounded-lg border mt-1 font-bold">
                                {announcement.priority === 'high' || announcement.priority === 'critical' ? (
                                    <Megaphone className="w-5 h-5 text-red-500" />
                                ) : (
                                    <Megaphone className="w-5 h-5 text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    {announcement.title}
                                    {announcement.priority === 'high' && (
                                        <Badge variant="destructive" className="text-[10px] h-4">High Priority</Badge>
                                    )}
                                </h3>
                                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    {new Date(announcement.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
