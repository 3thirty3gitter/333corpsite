'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileQuestion, Wrench, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/supabase/knowledge-base');
        const data = await res.json();
        if (data.success) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const categories = [
    { id: "all", name: "All Articles", count: articles.length },
    ...Array.from(new Set(articles.map(a => a.category))).filter(Boolean).map(cat => ({
      id: cat?.toLowerCase().replace(/ /g, '-'),
      name: cat,
      count: articles.filter(a => a.category === cat).length
    }))
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (article.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category?.toLowerCase().replace(/ /g, '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">Find answers, guides, and troubleshooting help.</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for articles, guides, or topics..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
        <div className="flex flex-wrap gap-2">
          {popularTopics.map((topic) => (
            <Button key={topic.name} variant="outline" className="gap-2">
              {topic.name}
              <Badge variant="secondary" className="ml-1">{topic.count}</Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <TrendingUp className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2 font-bold line-clamp-1">{article.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {article.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{article.view_count || 0} views</span>
                      <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/dashboard/knowledge-base/${article.id}`}>
                        Read Article <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredArticles.length === 0 && (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No articles found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or browse different categories.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>Can't find what you're looking for? We're here to help.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="font-semibold">Contact Support</span>
              <span className="text-xs text-muted-foreground">Get help from our team</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Submit Feedback</span>
              <span className="text-xs text-muted-foreground">Help us improve</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Request Article</span>
              <span className="text-xs text-muted-foreground">Suggest a new guide</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
