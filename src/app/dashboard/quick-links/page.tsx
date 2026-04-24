'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Edit, Trash2, Star, Folder, Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { QuickLinkDialog } from "./quick-link-dialog";
import { useToast } from "@/hooks/use-toast";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categories = [
  { id: "productivity", name: "Productivity", count: 0, color: "bg-blue-100 text-blue-700" },
  { id: "communication", name: "Communication", count: 0, color: "bg-green-100 text-green-700" },
  { id: "design", name: "Design", count: 0, color: "bg-purple-100 text-purple-700" },
  { id: "development", name: "Development", count: 0, color: "bg-orange-100 text-orange-700" },
  { id: "analytics", name: "Analytics", count: 0, color: "bg-pink-100 text-pink-700" }
];

export default function QuickLinksPage() {
  const { session } = useSupabaseAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchLinks();
  }, [refreshKey]);

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase/quick-links');
      const data = await res.json();
      if (data.success) {
        setLinks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quick links',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteLink(id: string) {
    try {
      const res = await fetch(`/api/supabase/quick-links/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Link deleted', description: 'The quick link has been removed.' });
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  const renderIcon = (icon: string) => {
    if (!icon) return <span className="text-3xl">🔗</span>;
    
    if (icon.startsWith('http')) {
      return <img src={icon} alt="icon" className="w-8 h-8 object-contain" />;
    }
    
    if (icon.startsWith('lucide:')) {
        return <DynamicIcon name={icon.replace('lucide:', '')} className="w-8 h-8" />;
    }
    
    return <span className="text-3xl">{icon}</span>;
  };

  if (loading && links.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Quick Links & Tools</h1>
          <p className="text-muted-foreground">Access frequently used apps and external resources.</p>
        </div>
        <QuickLinkDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
      </div>

      {/* All Links Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">All Tools & Resources</h2>
        {links.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No quick links found. Add your first link to get started.</p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {links.map((link) => (
                <Card key={link.id} className="hover:border-primary/50 transition-colors group">
                <CardContent className="p-4">
                    <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center justify-center w-10 h-10">
                            {renderIcon(link.icon || '🔗')}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <QuickLinkDialog 
                            link={link} 
                            onSuccess={() => setRefreshKey(prev => prev + 1)}
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Edit className="w-3 h-3" />
                              </Button>
                            }
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Quick Link</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{link.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteLink(link.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                        {link.title}
                        {link.is_sso && (
                            <Badge variant="secondary" className="text-xs">SSO</Badge>
                        )}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{link.url}</p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                    </Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Single Sign-On (SSO)</CardTitle>
            <CardDescription>Many tools support SSO with your company credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Look for the SSO badge on tools that allow you to sign in with your company email without creating a separate password.
            </p>
            <Button variant="outline" size="sm">
              Learn More About SSO
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need a New Tool?</CardTitle>
            <CardDescription>Request access to additional applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              If you need access to a tool that's not listed here, submit a request to IT for approval and setup.
            </p>
            <Button variant="outline" size="sm">
              Request Tool Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
