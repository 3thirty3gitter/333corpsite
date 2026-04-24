'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Package, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronRight,
  ExternalLink,
  Shirt,
  Printer,
  Box,
  Tag,
  ImageIcon,
  Loader2,
  Trash2,
  Pencil,
  CheckSquare,
  Square,
  X,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getPlaceholderForCategory } from '@/lib/placeholders';
import { SinaLitePricingCalculator } from '@/components/suppliers/sinalite-pricing-calculator';
import { calculateRetailPrice, MarkupRule } from '@/lib/markup';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Product from database
interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  source: string;
  source_id: string | null;
  msrp_currency: string | null;
  msrp_value: string | null;
  images: any[] | null;
  variants: any[] | null;
  options: any[] | Record<string, any> | null;
  active: boolean;
  featured: boolean;
  price?: number;
  created_at: string;
}

// Supplier info for display
const SUPPLIER_INFO: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
  momentec: { 
    name: 'Momentec', 
    color: 'bg-blue-500', 
    icon: <Shirt className="w-4 h-4" /> 
  },
  sinalite: { 
    name: 'SinaLite', 
    color: 'bg-orange-500', 
    icon: <Printer className="w-4 h-4" /> 
  },
  manual: { 
    name: 'Manual', 
    color: 'bg-gray-500', 
    icon: <Box className="w-4 h-4" /> 
  },
};

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Apparel': <Shirt className="w-5 h-5" />,
  'Print Products': <Printer className="w-5 h-5" />,
  'Business Cards': <Tag className="w-5 h-5" />,
  'Signage': <Package className="w-5 h-5" />,
};

export default function CatalogPage() {
  const { session } = useSupabaseAuth();
  const { toast } = useToast();
  
  // Data state
  const [products, setProducts] = React.useState<Product[]>([]);
  const [markupRules, setMarkupRules] = React.useState<MarkupRule[]>([]);
  const [showRetailPrice, setShowRetailPrice] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  
  // Detail modal state
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [fetchingImages, setFetchingImages] = React.useState(false);
  
  const fetchSinaLiteImages = async (productId: string, sku: string) => {
    try {
      setFetchingImages(true);
      const res = await fetch('/api/suppliers/sinalite/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ productId, sku }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Images Updated",
          description: `Found and saved ${data.count} image(s) from SinaLite.com`,
        });
        
        // Update local state to show the new images immediately
        setSelectedProduct(prev => prev ? { 
          ...prev, 
          images: data.images, 
          featured_image: data.images[0] 
        } : null);
        
        // Update the main products list too
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, images: data.images, featured_image: data.images[0] } : p
        ));
      } else {
        toast({
          title: "Scraping Failed",
          description: data.error || "Could not find any images for this SKU.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect to the scraper service.",
        variant: "destructive",
      });
    } finally {
      setFetchingImages(false);
    }
  };
  
  // Multi-select state
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  
  // Derived data
  const categories = React.useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, [products]);
  
  const suppliers = React.useMemo(() => {
    const sups = new Set(products.map(p => p.source).filter(Boolean));
    return ['all', ...Array.from(sups)] as string[];
  }, [products]);

  // Reset filters if selected values are no longer valid
  React.useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  React.useEffect(() => {
    if (!suppliers.includes(selectedSupplier)) {
      setSelectedSupplier('all');
    }
  }, [suppliers, selectedSupplier]);
  
  // Filtered and sorted products
  const filteredProducts = React.useMemo(() => {
    let result = products.filter(product => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          product.name?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.sku?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      
      // Supplier filter
      if (selectedSupplier !== 'all' && product.source !== selectedSupplier) {
        return false;
      }
      
      return true;
    });

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-low':
          return parseFloat(a.msrp_value || '0') - parseFloat(b.msrp_value || '0');
        case 'price-high':
          return parseFloat(b.msrp_value || '0') - parseFloat(a.msrp_value || '0');
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [products, searchTerm, selectedCategory, selectedSupplier, sortBy]);
  
  // Group by category for display
  const groupedProducts = React.useMemo(() => {
    const groups: Record<string, Product[]> = {};
    filteredProducts.forEach(product => {
      const cat = product.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(product);
    });
    return groups;
  }, [filteredProducts]);
  
  // Fetch products and markup rules
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [productsRes, markupRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/supabase/markup-rules')
        ]);
        
        const productsData = await productsRes.json();
        if (productsRes.ok && productsData.success) {
          setProducts(productsData.products || []);
        } else {
          setError(productsData.error || 'Failed to load products');
        }
        
        if (markupRes.ok) {
          const markupData = await markupRes.json();
          setMarkupRules(markupData.rules || []);
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Toggle product selection
  function toggleSelect(productId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }
  
  // Select all visible products
  function selectAll() {
    setSelectedIds(new Set(filteredProducts.map(p => p.id)));
  }
  
  // Clear selection
  function clearSelection() {
    setSelectedIds(new Set());
    setSelectMode(false);
  }
  
  // Delete selected products
  async function deleteSelected() {
    if (selectedIds.size === 0 || !session?.access_token) return;
    
    setDeleting(true);
    try {
      const res = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: 'Products deleted',
          description: `Successfully deleted ${data.deletedCount} product(s).`,
        });
        // Remove deleted products from state
        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
        clearSelection();
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }
  
  // Delete single product
  async function deleteSingleProduct(productId: string) {
    if (!session?.access_token) return;
    
    setDeleting(true);
    try {
      const res = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ids: [productId] }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: 'Product deleted',
          description: 'Successfully deleted the product.',
        });
        setProducts(prev => prev.filter(p => p.id !== productId));
        setSelectedProduct(null);
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  }
  
  // Get primary image for product
  function getProductImage(product: Product): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const url = extractImageUrl(product.images[0]);
      if (url) return url;
    }
    
    // Use placeholder based on category
    return getPlaceholderForCategory(product.category);
  }
  
  // Extract URL from any image format - handles objects, strings, and stringified JSON
  function extractImageUrl(img: any): string | null {
    if (!img) return null;
    
    // If it's a string, check if it's a JSON string that needs parsing
    if (typeof img === 'string') {
      // If it starts with http, it's already a URL
      if (img.startsWith('http')) return img;
      // Try to parse as JSON (might be stringified object)
      try {
        const parsed = JSON.parse(img);
        return extractImageUrl(parsed); // Recursively extract from parsed object
      } catch {
        return img; // Not JSON, return as-is
      }
    }
    
    // Handle object formats: {id, src, thumbnailSrc, alt, hint}
    if (typeof img === 'object' && img !== null) {
      if (img.src && typeof img.src === 'string') return img.src;
      if (img.url && typeof img.url === 'string') return img.url;
      if (img.hero && typeof img.hero === 'string') return img.hero;
      if (img.front && typeof img.front === 'string') return img.front;
      if (img.thumbnailSrc && typeof img.thumbnailSrc === 'string') return img.thumbnailSrc;
    }
    
    return null;
  }
  
  // Get supplier badge
  function SupplierBadge({ source }: { source: string }) {
    const info = SUPPLIER_INFO[source] || SUPPLIER_INFO.manual;
    return (
      <Badge variant="secondary" className={`${info.color} text-white text-xs`}>
        {info.icon}
        <span className="ml-1">{info.name}</span>
      </Badge>
    );
  }
  
  // Product card component
  function ProductCard({ product }: { product: Product }) {
    const image = getProductImage(product);
    const variantCount = product.variants?.length || 0;
    const isSelected = selectedIds.has(product.id);
        // Calculate display price
    const costPrice = parseFloat(product.msrp_value || '0');
    const retailPrice = calculateRetailPrice(costPrice, product.source, product.category, markupRules);
    const displayPrice = showRetailPrice ? retailPrice : costPrice;
        return (
      <Card 
        className={`overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => selectMode ? toggleSelect(product.id) : setSelectedProduct(product)}
      >
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {selectMode && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(product.id);
                }}
                className="h-5 w-5 bg-background"
              />
            </div>
          )}
          <Image 
            src={image} 
            alt={product.name} 
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <SupplierBadge source={product.source} />
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{product.name}</h3>
          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs">
              {product.category || 'Uncategorized'}
            </Badge>
            {variantCount > 0 && (
              <span className="text-xs text-muted-foreground">{variantCount} variants</span>
            )}
          </div>
          {product.msrp_value && (
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-sm font-bold text-primary">
                {product.msrp_currency || 'CAD'} ${displayPrice.toFixed(2)}
              </p>
              {showRetailPrice && (
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Retail</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Product list row component
  function ProductRow({ product }: { product: Product }) {
    const image = getProductImage(product);
    const variantCount = product.variants?.length || 0;
    const isSelected = selectedIds.has(product.id);
    
    // Calculate display price
    const costPrice = parseFloat(product.msrp_value || '0');
    const retailPrice = calculateRetailPrice(costPrice, product.source, product.category, markupRules);
    const displayPrice = showRetailPrice ? retailPrice : costPrice;

    return (
      <div 
        className={`flex items-center gap-4 p-4 border-b hover:bg-secondary/50 cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : ''}`}
        onClick={() => selectMode ? toggleSelect(product.id) : setSelectedProduct(product)}
      >
        {selectMode && (
          <Checkbox
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(product.id);
            }}
            className="h-5 w-5"
          />
        )}
        <div className="relative w-16 h-16 bg-secondary rounded overflow-hidden flex-shrink-0">
          <Image src={image} alt={product.name} fill className="object-contain p-1" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{product.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs hidden sm:inline-flex">
            {product.category || 'Uncategorized'}
          </Badge>
          <SupplierBadge source={product.source} />
          {variantCount > 0 && (
            <span className="text-xs text-muted-foreground hidden md:inline">{variantCount} variants</span>
          )}
          <div className="text-right flex-shrink-0 ml-2">
            <p className="font-bold text-primary">{product.msrp_currency || 'CAD'} ${displayPrice.toFixed(2)}</p>
            {showRetailPrice && (
              <p className="text-[10px] text-muted-foreground uppercase">Retail</p>
            )}
          </div>
          {product.source === 'sinalite' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                fetchSinaLiteImages(product.id, product.sku || '');
              }}
              disabled={fetchingImages}
              title="Sync images from SinaLite"
            >
              {fetchingImages ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  // Product detail modal
  function ProductDetailModal() {
    if (!selectedProduct) return null;
    
    const images = selectedProduct.images || [];
    const variants = selectedProduct.variants || [];
    const options = selectedProduct.options || [];
    
    return (
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  {selectedProduct.sku && <span>SKU: {selectedProduct.sku}</span>}
                  <SupplierBadge source={selectedProduct.source} />
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
              {/* Images */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden">
                  <Image 
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.slice(0, 5).map((img: any, i: number) => {
                      const imgUrl = extractImageUrl(img);
                      if (!imgUrl) return null;
                      return (
                        <div key={i} className="relative w-16 h-16 bg-secondary rounded flex-shrink-0">
                          <Image 
                            src={imgUrl}
                            alt={`${selectedProduct.name} ${i + 1}`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedProduct.description || 'No description available.'}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold">Category</h4>
                    <Badge variant="outline">{selectedProduct.category || 'Uncategorized'}</Badge>
                  </div>
                  {selectedProduct.msrp_value && (
                    <div>
                      <h4 className="font-semibold">Retail Price</h4>
                      <p className="text-2xl font-bold text-primary">
                        {selectedProduct.msrp_currency || 'CAD'} $
                        {calculateRetailPrice(
                          parseFloat(selectedProduct.msrp_value), 
                          selectedProduct.source, 
                          selectedProduct.category, 
                          markupRules
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cost: {selectedProduct.msrp_currency || 'CAD'} ${selectedProduct.msrp_value}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Variants */}
                {variants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Variants ({variants.length})</h4>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {variants.slice(0, 20).map((variant: any, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {variant.colorName || variant.name || variant.sku || `Variant ${i + 1}`}
                          {variant.sizeName && ` - ${variant.sizeName}`}
                        </Badge>
                      ))}
                      {variants.length > 20 && (
                        <Badge variant="outline" className="text-xs">+{variants.length - 20} more</Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Options / Pricing Calculator */}
                {selectedProduct.source === 'sinalite' && selectedProduct.source_id ? (
                  <div className="pt-4 border-t">
                    <SinaLitePricingCalculator 
                      productId={selectedProduct.source_id}
                      dbProductId={selectedProduct.id}
                      options={selectedProduct.options as Record<string, any> || {}}
                      initialPrice={selectedProduct.msrp_value || undefined}
                    />
                  </div>
                ) : (
                  Array.isArray(options) && options.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Options</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {options.slice(0, 10).map((opt: any, i: number) => (
                          <p key={i}>{typeof opt === 'string' ? opt : opt.name || JSON.stringify(opt)}</p>
                        ))}
                      </div>
                    </div>
                  )
                )}
                
                <div className="pt-4 border-t flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Source: {SUPPLIER_INFO[selectedProduct.source]?.name || selectedProduct.source}
                    {selectedProduct.source_id && ` (ID: ${selectedProduct.source_id})`}
                  </p>
                  <div className="flex gap-2">
                    {selectedProduct.source === 'sinalite' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchSinaLiteImages(selectedProduct.id, selectedProduct.sku || '')}
                        disabled={fetchingImages}
                      >
                        {fetchingImages ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-1" />
                        )}
                        Sync Images
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/products/${selectedProduct.id}/edit`}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit Product
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteSingleProduct(selectedProduct.id)}
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      Delete Product
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">Loading products from suppliers...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-destructive">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} of {products.length} products from {suppliers.length - 1} supplier{suppliers.length - 1 !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Select Mode Toggle */}
          {selectMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedIds.size === 0}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
              <CheckSquare className="w-4 h-4 mr-1" />
              Select
            </Button>
          )}
          <div className="border-l pl-2 ml-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected product{selectedIds.size !== 1 ? 's' : ''} from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteSelected} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products by name, SKU, or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Supplier Filter */}
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(sup => (
                  <SelectItem key={sup} value={sup}>
                    {sup === 'all' ? 'All Suppliers' : SUPPLIER_INFO[sup]?.name || sup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-low">Price (Low-High)</SelectItem>
                <SelectItem value="price-high">Price (High-Low)</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Mode Toggle */}
            <div className="flex items-center space-x-2 border-l pl-4 ml-auto">
              <Switch 
                id="price-mode" 
                checked={showRetailPrice} 
                onCheckedChange={setShowRetailPrice} 
              />
              <Label htmlFor="price-mode" className="text-sm font-medium whitespace-nowrap">
                Retail Price
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0 
                ? 'Import products from the Integrations page to get started.'
                : 'Try adjusting your search or filters.'}
            </p>
            {products.length === 0 && (
              <Button asChild>
                <a href="/dashboard/integrations">Go to Integrations</a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Products Display */}
      {filteredProducts.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            // Grid View - Grouped by Category
            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    {CATEGORY_ICONS[category] || <Package className="w-5 h-5" />}
                    <h2 className="text-xl font-semibold">{category}</h2>
                    <Badge variant="secondary">{categoryProducts.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <Card>
              <div className="divide-y">
                {filteredProducts.map(product => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
      
      {/* Product Detail Modal */}
      <ProductDetailModal />
    </div>
  );
}
