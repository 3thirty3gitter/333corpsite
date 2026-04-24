
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, FileText } from "lucide-react";
import { supabaseClient } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface UploadDocumentDialogProps {
  onDocumentUploaded: () => void;
  documentToUpdate?: {
    id: string;
    title: string;
    category: string;
  };
}

export function UploadDocumentDialog({ onDocumentUploaded, documentToUpdate }: UploadDocumentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    title: documentToUpdate?.title || '',
    description: '',
    category: documentToUpdate?.category || 'procedures',
    is_important: false,
    changes_summary: ''
  });

  React.useEffect(() => {
    if (documentToUpdate) {
      setFormData(prev => ({
        ...prev,
        title: documentToUpdate.title,
        category: documentToUpdate.category
      }));
    }
  }, [documentToUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseClient!.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabaseClient!.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 2. Save document record to database (or new version)
      const payload = {
        ...formData,
        file_url: publicUrl,
        file_type: fileExt?.toUpperCase() || 'UNKNOWN',
        file_size: formatBytes(file.size)
      };

      if (documentToUpdate) {
        (payload as any).id = documentToUpdate.id;
      }

      const response = await fetch('/api/supabase/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast({
        title: documentToUpdate ? "New version uploaded" : "Document uploaded",
        description: `${formData.title} has been ${documentToUpdate ? 'updated' : 'added to the library'}.`
      });

      setOpen(false);
      onDocumentUploaded();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: documentToUpdate?.title || '',
      description: '',
      category: documentToUpdate?.category || 'procedures',
      is_important: false,
      changes_summary: ''
    });
    setFile(null);
  };

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {documentToUpdate ? (
           <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            New Version
          </Button>
        ) : (
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{documentToUpdate ? `Upload New Version: ${documentToUpdate.title}` : 'Upload Document'}</DialogTitle>
            <DialogDescription>
              {documentToUpdate 
                ? 'Choose a new file to replace the current version. History will be preserved.' 
                : 'Add a new document to the internal employee repository.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {!documentToUpdate && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Employee Handbook 2026"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policies">Policies</SelectItem>
                      <SelectItem value="handbooks">Handbooks</SelectItem>
                      <SelectItem value="forms">Forms & Templates</SelectItem>
                      <SelectItem value="procedures">Procedures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description">{documentToUpdate ? 'Version Notes' : 'Description (Optional)'}</Label>
              <Textarea
                id="description"
                value={documentToUpdate ? formData.changes_summary : formData.description}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [documentToUpdate ? 'changes_summary' : 'description']: e.target.value 
                })}
                placeholder={documentToUpdate ? "What changed in this version?" : "Shortly describe the content of this document..."}
              />
            </div>

            {!documentToUpdate && (
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="important">Mark as Important</Label>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Will show up in the prioritized section
                  </p>
                </div>
                <Switch
                  id="important"
                  checked={formData.is_important}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_important: checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !file}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {documentToUpdate ? 'Upload Version' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
