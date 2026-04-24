'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Globe, History, X, Sparkles, FileSearch, Calculator, Map, Image, Video, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const quickSearches = [
  { name: "Images", icon: Image, url: "https://www.google.ca/imghp" },
  { name: "Maps", icon: Map, url: "https://www.google.ca/maps" },
  { name: "News", icon: FileSearch, url: "https://news.google.ca" },
  { name: "Videos", icon: Video, url: "https://www.google.ca/videohp" },
  { name: "Shopping", icon: ShoppingCart, url: "https://www.google.ca/shopping" },
];

export default function GoogleSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('google-search-history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Auto-search if query param is present
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (query: string, newTab: boolean = true) => {
    if (!query.trim()) return;

    // Add to search history
    const updatedHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem('google-search-history', JSON.stringify(updatedHistory));

    // Open Google search in new tab
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://www.google.ca/search?q=${encodedQuery}`;
    
    if (newTab) {
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = searchUrl;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, true);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('google-search-history');
  };

  const openQuickSearch = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg border border-primary/20 shadow-sm">
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-8 h-8"
            />
          </div>
          <span>Google Search</span>
        </h1>
        <p className="text-muted-foreground">
          Quick access to Google search and services from your dashboard
        </p>
      </div>

      {/* Main Search Bar */}
      <Card className="hover:border-primary/50 transition-all duration-300 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5"
            />
            <Search className="w-5 h-5 text-primary" />
            Search Google.ca
          </CardTitle>
          <CardDescription>
            Enter your search query - results will open in a new tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search Google..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base bg-secondary/50 border-secondary hover:border-primary/50 focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                disabled={!searchQuery.trim()}
                size="lg"
                className="min-w-[120px]"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              <span>Search opens in a new tab</span>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Access Services */}
      <Card className="hover:border-primary/50 transition-all duration-300 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Access
          </CardTitle>
          <CardDescription>
            Jump directly to Google services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {quickSearches.map((service) => {
              const Icon = service.icon;
              return (
                <Button
                  key={service.name}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                  onClick={() => openQuickSearch(service.url)}
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium">{service.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card className="hover:border-primary/50 transition-all duration-300 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent Searches
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearHistory}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 transform hover:-translate-y-0.5 px-3 py-1.5"
                  onClick={() => {
                    setSearchQuery(query);
                    handleSearch(query, true);
                  }}
                >
                  {query}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-secondary/30 border-secondary hover:border-primary/50 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Search Tips</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Use quotes for exact phrases: "print services"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Use site: to search specific websites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Use - to exclude terms: design -template</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-secondary hover:border-primary/50 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Quick Access</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Click service icons to open Google tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Recent searches saved for quick access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>All searches open in new tabs</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why New Tab Notice */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Why searches open in new tabs</p>
              <p className="text-sm text-muted-foreground">
                Google and most websites use security policies (CSP) that prevent embedding in iframes. 
                Opening in new tabs ensures full functionality including images, maps, and all Google features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
