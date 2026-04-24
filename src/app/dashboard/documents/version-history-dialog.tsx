'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Download, ExternalLink, Clock, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VersionHistoryDialogProps {
  documentId: string;
  documentTitle: string;
}

export function VersionHistoryDialog({ documentId, documentTitle }: VersionHistoryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [versions, setVersions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/supabase/documents?documentId=${documentId}`);
      const data = await res.json();
      if (data.success) {
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, documentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Version History: {documentTitle}</DialogTitle>
          <DialogDescription>
            View and download previous versions of this document.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((v, index) => (
                <div key={v.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="bg-secondary p-2 rounded-full mt-1">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="font-semibold text-sm">v{v.version_number}</span>
                         {index === 0 && <Badge variant="default" className="bg-green-500 text-[10px] h-4">Current</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                       "{v.changes_summary || 'No description provided'}"
                    </p>
                    <div className="flex gap-2 mt-2">
                       <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
                          <a href={v.file_url} target="_blank" rel="noopener noreferrer">
                             <ExternalLink className="w-3 h-3 mr-1" />
                             View
                          </a>
                       </Button>
                       <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
                          <a href={v.file_url} download>
                             <Download className="w-3 h-3 mr-1" />
                             Download
                          </a>
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
               No version history found for this document.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
