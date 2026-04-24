'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, User, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/supabase/knowledge-base?id=${id}`);
        const data = await res.json();
        if (data.success && data.article) {
          setArticle(data.article);
          // Increment view count
          fetch(`/api/supabase/knowledge-base/view?id=${id}`, { method: 'POST' });
        } else {
          console.error('Article not found');
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Article not found</h2>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Knowledge Base
      </Button>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(article.updated_at).toLocaleDateString()}
            </span>
          </div>
          <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {article.title}
          </CardTitle>
          <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {article.view_count || 0} views
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-0 mt-8">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-li:my-1 prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-8 mt-12 pb-12">
        <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Yes, thanks!</Button>
          <Button variant="outline" size="sm">Not really</Button>
        </div>
      </div>
    </div>
  );
}
