'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useRequireAdmin } from '@/hooks/use-require-admin';
import { Loader2, Search, Package, Settings, Download, Check, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface MomentecProduct {
  styleNumber: string;
  name: string;
  msrp: { currency: string; value: string };
  images: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    leftQuarter?: string;
    hero?: string;
  };
  variants: {
    sku: string;
    colorName: string;
    sizeName: string;
    quantity: number;
  }[];
  rawData: any;
}

interface SinaLiteProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  enabled: boolean;
  source: string;
  source_id: string;
}

interface SupplierSettings {
  id: string;
  enabled: boolean;
  credentials: {
    logonId?: string;
    password?: string;
    client_id?: string;
    client_secret?: string;
    store_code?: number;
    use_production?: boolean;
  };
  settings: any;
}

export default function IntegrationsPage() {
  useRequireAdmin();
  const { session } = useSupabaseAuth();
  const { toast } = useToast();

  // Settings state
  const [suppliers, setSuppliers] = useState<SupplierSettings[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Momentec form state
  const [momentecEnabled, setMomentecEnabled] = useState(false);
  const [momentecLogonId, setMomentecLogonId] = useState('');
  const [momentecPassword, setMomentecPassword] = useState('');

  // SinaLite form state
  const [sinaliteEnabled, setSinaliteEnabled] = useState(false);
  const [sinaliteClientId, setSinaliteClientId] = useState('');
  const [sinaliteClientSecret, setSinaliteClientSecret] = useState('');
  const [sinaliteStoreCode, setSinaliteStoreCode] = useState(9); // 9 = US, 6 = Canada
  const [sinaliteUseProduction, setSinaliteUseProduction] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MomentecProduct[]>([]);
  const [importing, setImporting] = useState<string | null>(null);

  // SinaLite search state
  const [sinaliteSearchQuery, setSinaliteSearchQuery] = useState('');
  const [sinaliteSearching, setSinaliteSearching] = useState(false);
  const [sinaliteResults, setSinaliteResults] = useState<SinaLiteProduct[]>([]);
  const [sinaliteCategories, setSinaliteCategories] = useState<string[]>([]);
  const [sinaliteImporting, setSinaliteImporting] = useState<number | null>(null);
  const [selectedSinaliteIds, setSelectedSinaliteIds] = useState<Set<number>>(new Set());
  const [bulkImporting, setBulkImporting] = useState(false);

  // Fetch supplier settings on load
  useEffect(() => {
    async function fetchSettings() {
      if (!session?.access_token) return;

      try {
        const res = await fetch('/api/suppliers/settings', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        
        if (data.success && data.suppliers) {
          setSuppliers(data.suppliers);
          
          // Find Momentec settings
          const momentec = data.suppliers.find((s: SupplierSettings) => s.id === 'momentec');
          if (momentec) {
            setMomentecEnabled(momentec.enabled);
            setMomentecLogonId(momentec.credentials?.logonId || '');
            setMomentecPassword(momentec.credentials?.password || '');
          }

          // Find SinaLite settings
          const sinalite = data.suppliers.find((s: SupplierSettings) => s.id === 'sinalite');
          if (sinalite) {
            setSinaliteEnabled(sinalite.enabled);
            setSinaliteClientId(sinalite.credentials?.client_id || '');
            setSinaliteClientSecret(sinalite.credentials?.client_secret || '');
            setSinaliteStoreCode(sinalite.credentials?.store_code || 9);
            setSinaliteUseProduction(sinalite.credentials?.use_production || false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    }

    fetchSettings();
  }, [session]);

  // Save Momentec settings
  async function saveMomentecSettings() {
    if (!session?.access_token) return;

    setSavingSettings(true);
    try {
      const res = await fetch('/api/suppliers/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          supplierId: 'momentec',
          enabled: momentecEnabled,
          credentials: {
            logonId: momentecLogonId,
            password: momentecPassword,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Settings saved', description: 'Momentec integration settings updated.' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ 
        title: 'Failed to save settings', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  }

  // Save SinaLite settings
  async function saveSinaliteSettings() {
    if (!session?.access_token) return;

    setSavingSettings(true);
    try {
      const res = await fetch('/api/suppliers/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          supplierId: 'sinalite',
          enabled: sinaliteEnabled,
          credentials: {
            client_id: sinaliteClientId,
            client_secret: sinaliteClientSecret,
            store_code: sinaliteStoreCode,
            use_production: sinaliteUseProduction,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Settings saved', description: 'SinaLite integration settings updated.' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ 
        title: 'Failed to save settings', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  }

  // Search SinaLite
  async function searchSinalite() {
    if (!session?.access_token) return;

    setSinaliteSearching(true);
    setSinaliteResults([]);

    try {
      const params = new URLSearchParams();
      if (sinaliteSearchQuery.trim()) {
        params.set('query', sinaliteSearchQuery.trim());
      }
      
      const res = await fetch(`/api/suppliers/sinalite/products?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      
      if (data.products) {
        setSinaliteResults(data.products);
        setSinaliteCategories(data.categories || []);
        if (data.products.length === 0) {
          toast({ title: 'No results', description: 'No products found matching your search.' });
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      toast({ 
        title: 'Search failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSinaliteSearching(false);
    }
  }

  // Import SinaLite product
  async function importSinaliteProduct(product: SinaLiteProduct) {
    if (!session?.access_token) return;

    setSinaliteImporting(product.id);

    try {
      const res = await fetch('/api/suppliers/sinalite/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const data = await res.json();
      
      if (data.success && data.imported > 0) {
        toast({ 
          title: 'Product imported!', 
          description: `${product.name} added to your catalog.`,
        });
        // Remove from results
        setSinaliteResults(prev => prev.filter(p => p.id !== product.id));
      } else {
        // Show the actual error from the API response
        const errorMsg = data.error || data.details?.errors?.[0]?.error || 'Import failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      toast({ 
        title: 'Import failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSinaliteImporting(null);
    }
  }

  // Bulk Import SinaLite products
  async function importSinaliteBulk() {
    if (!session?.access_token || selectedSinaliteIds.size === 0) return;

    setBulkImporting(true);
    const idsToImport = Array.from(selectedSinaliteIds);

    try {
      const res = await fetch('/api/suppliers/sinalite/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId: idsToImport,
        }),
      });

      const data = await res.json();
      
      if (data.success && data.imported > 0) {
        toast({ 
          title: 'Bulk import complete!', 
          description: `Successfully imported ${data.imported} products.`,
        });
        // Remove imported products from results
        const importedIds = new Set(data.details?.imported?.map((p: any) => parseInt(p.source_id, 10)) || []);
        setSinaliteResults(prev => prev.filter(p => !importedIds.has(p.id)));
        setSelectedSinaliteIds(new Set());
      } else {
        const errorMsg = data.error || 'Bulk import failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      toast({ 
        title: 'Bulk import failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setBulkImporting(false);
    }
  }

  function toggleSinaliteSelection(id: number) {
    setSelectedSinaliteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAllSinalite() {
    setSelectedSinaliteIds(new Set(sinaliteResults.map(p => p.id)));
  }

  // Search Momentec
  async function searchMomentec() {
    if (!session?.access_token || !searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch('/api/suppliers/momentec/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productOrDesignNumber: searchQuery.trim(),
        }),
      });

      const data = await res.json();
      
      if (data.products) {
        setSearchResults(data.products);
        if (data.products.length === 0) {
          toast({ title: 'No results', description: `No products found for "${searchQuery}"` });
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      toast({ 
        title: 'Search failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  }

  // Import product
  async function importProduct(product: MomentecProduct) {
    if (!session?.access_token) return;

    setImporting(product.styleNumber);

    try {
      const res = await fetch('/api/suppliers/momentec/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product,
          category: 'Apparel',
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast({ 
          title: 'Product imported!', 
          description: `${product.name} added with ${data.variantCount} variants.`,
        });
        // Remove from search results
        setSearchResults(prev => prev.filter(p => p.styleNumber !== product.styleNumber));
      } else if (res.status === 409) {
        toast({ title: 'Already exists', description: 'This product is already in your catalog.' });
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (error) {
      toast({ 
        title: 'Import failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImporting(null);
    }
  }

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supplier Integrations</h1>
        <p className="text-muted-foreground">Configure supplier APIs and import products to your catalog.</p>
      </div>

      <Tabs defaultValue="momentec" className="w-full">
        <TabsList>
          <TabsTrigger value="momentec">Momentec</TabsTrigger>
          <TabsTrigger value="sinalite">SinaLite</TabsTrigger>
        </TabsList>

        <TabsContent value="momentec" className="space-y-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Momentec Configuration</CardTitle>
                    <CardDescription>Enter your Momentec API credentials</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={momentecEnabled}
                    onCheckedChange={setMomentecEnabled}
                  />
                  <span className="text-sm">{momentecEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logonId">Login ID</Label>
                  <Input
                    id="logonId"
                    value={momentecLogonId}
                    onChange={(e) => setMomentecLogonId(e.target.value)}
                    placeholder="Your Momentec login"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={momentecPassword}
                    onChange={(e) => setMomentecPassword(e.target.value)}
                    placeholder="Your Momentec password"
                  />
                </div>
              </div>
              <Button onClick={saveMomentecSettings} disabled={savingSettings}>
                {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Search Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle>Search Momentec Catalog</CardTitle>
                  <CardDescription>Search by style number to find and import products</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter style number (e.g., 5000)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchMomentec()}
                  disabled={!momentecEnabled}
                />
                <Button 
                  onClick={searchMomentec} 
                  disabled={!momentecEnabled || searching || !searchQuery.trim()}
                >
                  {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>

              {!momentecEnabled && (
                <p className="text-sm text-muted-foreground">
                  Enable Momentec integration and save your credentials to search products.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>Found {searchResults.length} product(s)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((product) => (
                    <Card key={product.styleNumber} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="relative w-full md:w-48 h-48 bg-secondary flex-shrink-0">
                          {product.images?.hero || product.images?.front ? (
                            <Image
                              src={product.images.hero || product.images.front || ''}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">Style: {product.styleNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                MSRP: {product.msrp?.currency} {product.msrp?.value}
                              </p>
                            </div>
                            <Button
                              onClick={() => importProduct(product)}
                              disabled={importing === product.styleNumber}
                            >
                              {importing === product.styleNumber ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-2" />
                              )}
                              Import
                            </Button>
                          </div>

                          {/* Variants Summary */}
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">
                              {product.variants?.length || 0} variants
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(product.variants?.map(v => v.colorName).filter(Boolean))].slice(0, 8).map((color) => (
                                <Badge key={color} variant="secondary" className="text-xs">
                                  {color}
                                </Badge>
                              ))}
                              {[...new Set(product.variants?.map(v => v.colorName).filter(Boolean))].length > 8 && (
                                <Badge variant="outline" className="text-xs">
                                  +{[...new Set(product.variants?.map(v => v.colorName).filter(Boolean))].length - 8} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sinalite" className="space-y-6">
          {/* SinaLite Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle>SinaLite Configuration</CardTitle>
                    <CardDescription>Enter your SinaLite API credentials (OAuth2)</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sinaliteEnabled}
                    onCheckedChange={setSinaliteEnabled}
                  />
                  <span className="text-sm">{sinaliteEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={sinaliteClientId}
                    onChange={(e) => setSinaliteClientId(e.target.value)}
                    placeholder="Your SinaLite client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={sinaliteClientSecret}
                    onChange={(e) => setSinaliteClientSecret(e.target.value)}
                    placeholder="Your SinaLite client secret"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeCode">Store Region</Label>
                  <select
                    id="storeCode"
                    value={sinaliteStoreCode}
                    onChange={(e) => setSinaliteStoreCode(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={9}>United States (9)</option>
                    <option value={6}>Canada (6)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="useProduction"
                    checked={sinaliteUseProduction}
                    onCheckedChange={setSinaliteUseProduction}
                  />
                  <Label htmlFor="useProduction">Use Production API</Label>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {sinaliteUseProduction 
                  ? 'Connected to: liveapi.sinalite.com'
                  : 'Connected to: api.sinaliteuppy.com (staging)'}
              </div>
              <Button onClick={saveSinaliteSettings} disabled={savingSettings}>
                {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* SinaLite Search Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle>Browse SinaLite Products</CardTitle>
                  <CardDescription>Search their print product catalog to import items</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, SKU, or category..."
                  value={sinaliteSearchQuery}
                  onChange={(e) => setSinaliteSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSinalite()}
                  disabled={!sinaliteEnabled}
                />
                <Button 
                  onClick={searchSinalite} 
                  disabled={!sinaliteEnabled || sinaliteSearching}
                >
                  {sinaliteSearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>

              {!sinaliteEnabled && (
                <p className="text-sm text-muted-foreground">
                  Enable SinaLite integration and save your credentials to browse products.
                </p>
              )}

              {sinaliteCategories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-sm text-muted-foreground mr-2">Categories:</span>
                  {sinaliteCategories.slice(0, 10).map((cat) => (
                    <Badge 
                      key={cat} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-secondary"
                      onClick={() => {
                        setSinaliteSearchQuery(cat);
                        searchSinalite();
                      }}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SinaLite Search Results */}
          {sinaliteResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <CardTitle>SinaLite Products</CardTitle>
                      <CardDescription>Found {sinaliteResults.length} product(s)</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllSinalite}
                      disabled={sinaliteResults.length === 0}
                    >
                      Select All
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={importSinaliteBulk}
                      disabled={selectedSinaliteIds.size === 0 || bulkImporting}
                    >
                      {bulkImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      Import ({selectedSinaliteIds.size})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {sinaliteResults.map((product) => (
                    <div key={product.id} className="py-4 flex items-center gap-4">
                      <Checkbox 
                        checked={selectedSinaliteIds.has(product.id)}
                        onCheckedChange={() => toggleSinaliteSelection(product.id)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          {product.category && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                            </>
                          )}
                          {product.enabled ? (
                            <Check className="w-4 h-4 text-green-500" title="Enabled" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" title="Disabled" />
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => importSinaliteProduct(product)}
                        disabled={sinaliteImporting === product.id}
                        size="sm"
                        variant="ghost"
                      >
                        {sinaliteImporting === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span className="sr-only">Import</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
