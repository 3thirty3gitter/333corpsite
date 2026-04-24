"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Upload, Image as ImageIcon, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient } from "@/lib/supabase";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

interface ToolDialogProps {
  tool?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const ICON_LIBRARY = [
  "Activity", "Airplay", "AlertCircle", "Archive", "Award", "BarChart", "Bell", "Book", 
  "Bookmark", "Box", "Briefcase", "Calendar", "Camera", "Check", "Circle", "Clipboard", 
  "Clock", "Cloud", "Code", "Command", "Compass", "Copy", "CreditCard", "Database", 
  "Disc", "DollarSign", "Download", "Droplet", "Edit", "Eye", "File", "FileText", 
  "Filter", "Flag", "Folder", "Gift", "Globe", "Grid", "HardDrive", "Hash", "Headphones", 
  "Heart", "HelpCircle", "Home", "Image", "Inbox", "Info", "Key", "Layers", "Layout", 
  "LifeBuoy", "Link", "List", "Lock", "LogOut", "Mail", "Map", "MapPin", "Maximize", 
  "Menu", "MessageCircle", "MessageSquare", "Mic", "Minimize", "Monitor", "Moon", 
  "MoreHorizontal", "MoreVertical", "MousePointer", "Move", "Music", "Navigation", 
  "Package", "Paperclip", "Pause", "PenTool", "Percent", "Phone", "PieChart", "Play", 
  "Plus", "Power", "Printer", "Radio", "RefreshCw", "Save", "Search", "Send", "Server", 
  "Settings", "Share", "Shield", "ShoppingBag", "ShoppingCart", "Shuffle", "Sidebar", 
  "SkipBack", "SkipForward", "Slack", "Slash", "Sliders", "Smartphone", "Smile", 
  "Speaker", "Square", "Star", "StopCircle", "Sun", "Sunrise", "Sunset", "Tablet", 
  "Tag", "Target", "Terminal", "Thermometer", "ThumbsDown", "ThumbsUp", "ToggleLeft", 
  "ToggleRight", "Tool", "Trash", "Trash2", "TrendingDown", "TrendingUp", "Triangle", 
  "Truck", "Tv", "Twitter", "Type", "Umbrella", "Unlock", "Upload", "User", "UserCheck", 
  "UserMinus", "UserPlus", "UserX", "Users", "Video", "Voicemail", "Volume", "Volume1", 
  "Volume2", "VolumeX", "Watch", "Wifi", "WifiOff", "Wind", "X", "Zap", "ZoomIn", "ZoomOut"
];

export function ToolDialog({ tool, onSuccess, trigger }: ToolDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [iconType, setIconType] = useState("library"); // emoji, library, upload
  const [iconValue, setIconValue] = useState("lucide:Box");
  const [ctaText, setCtaText] = useState("Launch Tool");
  const [badgeText, setBadgeText] = useState("");
  
  const { toast } = useToast();
  const isEdit = !!tool;

  useEffect(() => {
    if (open) {
      if (tool) {
        setTitle(tool.title || "");
        setDescription(tool.description || "");
        setUrl(tool.url || "");
        setCtaText(tool.cta_text || "Launch Tool");
        setBadgeText(tool.badge_text || "");
        
        const icon = tool.icon || "lucide:Box";
        setIconValue(icon);
        
        if (icon.startsWith("http")) {
          setIconType("upload");
        } else if (icon.startsWith("lucide:")) {
          setIconType("library");
        } else {
          setIconType("emoji");
        }
      } else {
        // Reset for add mode
        setTitle("");
        setDescription("");
        setUrl("");
        setIconValue("lucide:Box");
        setIconType("library");
        setCtaText("Launch Tool");
        setBadgeText("");
      }
    }
  }, [open, tool]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabaseClient) {
        toast({ title: 'Supabase client not initialized', variant: 'destructive' });
        return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `tool-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('quick_link_icons') // Reusing the same bucket
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabaseClient.storage.from('quick_link_icons').getPublicUrl(filePath);
      setIconValue(data.publicUrl);
      setIconType("upload");
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isEdit 
        ? `/api/supabase/tools/${tool.id}` 
        : '/api/supabase/tools';
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description,
          url, 
          icon: iconValue, 
          cta_text: ctaText,
          badge_text: badgeText
        })
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'add'} tool`);
      }

      toast({
        title: isEdit ? 'Tool updated' : 'Tool added',
        description: `${title} has been ${isEdit ? 'updated' : 'added'}`
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: `Failed to ${isEdit ? 'update' : 'add'} tool`,
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tool' : 'Add Quick Access Tool'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details of this tool.' : 'Add a new tool to the dashboard quick access section.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g. PrintPilot"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Short description of what this tool does..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://..."
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Icon</Label>
              <div className="col-span-3">
                <Tabs value={iconType} className="w-full" onValueChange={(v) => setIconType(v)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="library"><ImageIcon className="w-4 h-4 mr-2"/> Library</TabsTrigger>
                    <TabsTrigger value="emoji"><Smile className="w-4 h-4 mr-2"/> Emoji</TabsTrigger>
                    <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-2"/> Upload</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="library" className="pt-4">
                    <div className="h-[200px] overflow-y-auto border rounded-md p-2 grid grid-cols-6 gap-2">
                        {ICON_LIBRARY.map((iconName) => (
                            <Button
                                key={iconName}
                                type="button"
                                variant={iconValue === `lucide:${iconName}` ? "default" : "ghost"}
                                className="h-10 w-10 p-0"
                                onClick={() => {
                                    setIconValue(`lucide:${iconName}`);
                                    setIconType('library');
                                }}
                            >
                                <DynamicIcon name={iconName} className="w-5 h-5" />
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Select an icon from the library.</p>
                  </TabsContent>

                  <TabsContent value="emoji" className="pt-4">
                    <div className="flex gap-2">
                      <Input
                        value={iconType === 'emoji' ? iconValue : ''}
                        onChange={(e) => {
                            setIconValue(e.target.value);
                            setIconType('emoji');
                        }}
                        placeholder="Paste an emoji here"
                        className="flex-1"
                      />
                      <div className="flex items-center justify-center w-10 h-10 border rounded bg-secondary text-xl">
                        {iconType === 'emoji' ? iconValue : '🔗'}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="pt-4">
                    <div className="flex flex-col gap-4">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        {uploading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-3 h-3 mr-2 animate-spin"/> Uploading...</div>}
                        {iconType === 'upload' && iconValue.startsWith('http') && (
                            <div className="flex justify-center p-4 border rounded bg-muted/10">
                                <img src={iconValue} alt="Preview" className="h-16 w-16 object-contain" />
                            </div>
                        )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cta" className="text-right">
                Button Text
              </Label>
              <Input
                id="cta"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Launch Tool"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="badge" className="text-right">
                Badge Text
              </Label>
              <Input
                id="badge"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="col-span-3"
                placeholder="e.g. New"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || uploading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Tool'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
