'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Search, FolderOpen, Calendar, FileCheck, Loader2, Trash2, ExternalLink, History, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { VersionHistoryDialog } from "./version-history-dialog";
import { useEmployeeRole } from "@/hooks/use-employee-role";
import { useToast } from "@/hooks/use-toast";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useEmployeeRole();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/supabase/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        toast({
          title: "Failed to load documents",
          description: data.error || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      toast({
        title: "Network error",
        description: "Could not connect to the server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const deleteDocument = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/supabase/documents?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Document deleted" });
        fetchDocuments();
      }
    } catch (err) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const documentCategories = [
    { id: "all", name: "All Documents", count: documents.length },
    { id: "policies", name: "Policies", count: documents.filter(d => d.category === 'policies').length },
    { id: "handbooks", name: "Handbooks", count: documents.filter(d => d.category === 'handbooks').length },
    { id: "forms", name: "Forms & Templates", count: documents.filter(d => d.category === 'forms').length },
    { id: "procedures", name: "Procedures", count: documents.filter(d => d.category === 'procedures').length }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const importantDocuments = documents.filter(doc => doc.is_important);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Company Documents</h1>
          <p className="text-muted-foreground">Access policies, handbooks, forms, and templates.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <UploadDocumentDialog onDocumentUploaded={fetchDocuments} />
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search documents..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-card">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          ) : (
            <>
              {/* Important Documents */}
              {selectedCategory === "all" && !searchQuery && importantDocuments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-red-500" />
                      Important Documents
                    </CardTitle>
                    <CardDescription>Documents you should review and keep handy.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {importantDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-xs text-muted-foreground">{doc.file_size || doc.size} • Updated {new Date(doc.updated_at || doc.created_at || doc.lastUpdated).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                            <VersionHistoryDialog documentId={doc.id} documentTitle={doc.title} />
                            {isAdmin && (
                              <>
                                <UploadDocumentDialog 
                                  onDocumentUploaded={fetchDocuments} 
                                  documentToUpdate={{ id: doc.id, title: doc.title, category: doc.category }} 
                                />
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteDocument(doc.id, doc.title)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  {documentCategories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-6">
                  <div className="grid gap-4">
                    {filteredDocuments.map((doc) => (
                      <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-secondary p-3 rounded-lg border">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold flex items-center gap-2">
                                    {doc.title}
                                    {doc.is_important && <Badge variant="destructive" className="text-xs">Important</Badge>}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant="outline">{doc.file_type || doc.type}</Badge>
                                  {isAdmin && (
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="text-destructive h-8 w-8" 
                                      onClick={() => deleteDocument(doc.id, doc.title)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                                <span>{doc.file_size || doc.size}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Updated {new Date(doc.updated_at || doc.created_at || doc.lastUpdated).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="default" asChild>
                                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </a>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={doc.file_url} download>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                                <VersionHistoryDialog documentId={doc.id} documentTitle={doc.title} />
                                {isAdmin && (
                                  <UploadDocumentDialog 
                                    onDocumentUploaded={fetchDocuments} 
                                    documentToUpdate={{ id: doc.id, title: doc.title, category: doc.category }} 
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredDocuments.length === 0 && (
                      <Card className="p-12">
                        <div className="text-center space-y-2">
                          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                          <h3 className="text-lg font-semibold">No documents found</h3>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or browse different categories.
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Request Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download All Forms
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileCheck className="w-4 h-4 mr-2" />
                Acknowledgments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
