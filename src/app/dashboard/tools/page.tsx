'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Edit, Trash2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { ToolDialog } from "./tool-dialog";
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

export default function ToolsPage() {
  const { session } = useSupabaseAuth();
  const { toast } = useToast();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTools();
  }, [refreshKey]);

  async function fetchTools() {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase/tools');
      const data = await res.json();
      if (data.success) {
        setTools(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tools',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteTool(id: string) {
    try {
      const res = await fetch(`/api/supabase/tools/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Tool deleted', description: 'The tool has been removed.' });
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  const renderIcon = (icon: string) => {
    if (!icon) return <span className="text-3xl">📦</span>;
    
    if (icon.startsWith('http')) {
      return <img src={icon} alt="icon" className="w-8 h-8 object-contain" />;
    }
    
    if (icon.startsWith('lucide:')) {
        return <DynamicIcon name={icon.replace('lucide:', '')} className="w-8 h-8" />;
    }
    
    return <span className="text-3xl">{icon}</span>;
  };

  if (loading && tools.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Quick Access Tools</h1>
          <p className="text-muted-foreground">Manage the tools displayed on the dashboard.</p>
        </div>
        <ToolDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
      </div>

      {/* All Tools Grid */}
      <div className="space-y-4">
        {tools.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No tools found. Add your first tool to get started.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
                <Card key={tool.id} className="flex flex-col hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md group">
                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
                    <div className="bg-secondary p-3 rounded-lg border">
                        {renderIcon(tool.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg truncate">{tool.title}</CardTitle>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ToolDialog 
                                    tool={tool} 
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
                                        <AlertDialogTitle>Delete Tool</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        Are you sure you want to delete "{tool.title}"? This will remove it from the dashboard for all users.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteTool(tool.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <CardDescription className="mt-1 text-sm line-clamp-2 h-10">{tool.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end pt-0">
                    <Button asChild className="w-full mt-4" variant="outline">
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
    </div>
  );
}
