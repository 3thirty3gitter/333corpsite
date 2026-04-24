'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Loader2, Check, ShoppingBag, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MomentecProduct {
  styleNumber: string;
  name: string;
  msrp: {
    currency: string;
    value: string;
  };
  images: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    leftQuarter?: string;
    hero?: string;
  };
  altImages?: string[];
  variants: {
    sku: string;
    colorName: string;
    sizeName: string;
    quantity: number;
  }[];
  imagesByColor?: Record<string, string>;
  rawData: any;
}

interface MomentecImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DEFAULT_CATEGORIES = [
  'Apparel',
  'Headwear',
  'Bags',
  'Accessories',
  'Promotional Products',
  'Print Products'
];

export default function MomentecImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: MomentecImportDialogProps) {
  const { toast } = useToast();
  const { session } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [products, setProducts] = useState<MomentecProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<MomentecProduct[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  
  // Variant selection state
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [activeProductForVariants, setActiveProductForVariants] = useState<MomentecProduct | null>(null);
  const [selectedVariantsByProduct, setSelectedVariantsByProduct] = useState<Record<string, string[]>>({}); // styleNumber -> sku[]

  const [selectedCategory, setSelectedCategory] = useState<string>('Apparel');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search terms required',
        description: 'Please enter at least one Momentec style number',
        variant: 'destructive',
      });
      return;
    }

    if (!session?.access_token) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to search for products',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    setProducts([]);
    setSelectedProducts([]);
    setSelectedVariantsByProduct({});

    try {
      const terms = searchQuery.split(/[\n,]+/).map(t => t.trim()).filter(t => t.length > 0);
      const uniqueTerms = [...new Set(terms)];
      const allProducts: MomentecProduct[] = [];
      const newSelectedVariants: Record<string, string[]> = {};

      // Search for each term
      for (const term of uniqueTerms) {
        try {
          const response = await fetch('/api/suppliers/momentec/search', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              productOrDesignNumber: term,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.products && data.products.length > 0) {
              allProducts.push(...data.products);
              
              // Pre-select all variants for found products
              data.products.forEach((p: MomentecProduct) => {
                newSelectedVariants[p.styleNumber] = p.variants.map(v => v.sku);
              });
            }
          }
        } catch (err) {
          console.error(`Error searching for ${term}:`, err);
        }
      }

      if (allProducts.length === 0) {
        toast({
          title: 'No products found',
          description: `No products found for the provided style numbers`,
          variant: 'destructive',
        });
        return;
      }

      setProducts(allProducts);
      setSelectedProducts(allProducts); // Auto-select all found products
      setSelectedVariantsByProduct(newSelectedVariants);

      toast({
        title: 'Search successful',
        description: `Found ${allProducts.length} product${allProducts.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const toggleVariant = (sku: string) => {
    if (!activeProductForVariants) return;
    
    const currentVariants = selectedVariantsByProduct[activeProductForVariants.styleNumber] || [];
    const newVariants = currentVariants.includes(sku)
      ? currentVariants.filter(s => s !== sku)
      : [...currentVariants, sku];
      
    setSelectedVariantsByProduct(prev => ({
      ...prev,
      [activeProductForVariants.styleNumber]: newVariants
    }));
  };

  const selectAllVariants = () => {
    if (!activeProductForVariants) return;
    
    setSelectedVariantsByProduct(prev => ({
      ...prev,
      [activeProductForVariants.styleNumber]: activeProductForVariants.variants.map(v => v.sku)
    }));
  };

  const clearAllVariants = () => {
    if (!activeProductForVariants) return;
    
    setSelectedVariantsByProduct(prev => ({
      ...prev,
      [activeProductForVariants.styleNumber]: []
    }));
  };

  const toggleProductSelection = (product: MomentecProduct) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.styleNumber === product.styleNumber);
      if (isSelected) {
        return prev.filter(p => p.styleNumber !== product.styleNumber);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleBulkImport = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'No products selected',
        description: 'Please select at least one product to import',
        variant: 'destructive',
      });
      return;
    }

    if (!session?.access_token) return;

    setImporting(true);
    let successCount = 0;
    let failedCount = 0;
    setImportProgress({ current: 0, total: selectedProducts.length, success: 0, failed: 0 });

    try {
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        const variants = selectedVariantsByProduct[product.styleNumber] || [];
        
        if (variants.length === 0) {
            failedCount++;
            setImportProgress(prev => ({ ...prev, current: i + 1, failed: prev.failed + 1 }));
            continue;
        }

        try {
            const filteredProduct = {
                ...product,
                variants: product.variants.filter(v => variants.includes(v.sku))
            };
            
            const response = await fetch('/api/suppliers/momentec/import', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  product: filteredProduct,
                  category: selectedCategory,
                }),
            });
            
            if (!response.ok && response.status !== 409) {
                throw new Error('Import failed');
            }
            
            successCount++;
            setImportProgress(prev => ({ ...prev, current: i + 1, success: prev.success + 1 }));
            
        } catch (err) {
            console.error(`Failed to import ${product.styleNumber}`, err);
            failedCount++;
            setImportProgress(prev => ({ ...prev, current: i + 1, failed: prev.failed + 1 }));
        }
      }

      toast({
        title: 'Bulk Import Completed',
        description: `Successfully imported ${successCount} products. Failed: ${failedCount}`,
      });

      if (onSuccess) onSuccess();
      
      if (failedCount === 0) {
          setSearchQuery('');
          setProducts([]);
          setSelectedProducts([]);
          onOpenChange(false);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import process failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const getFirstImage = (product: MomentecProduct) => {
    return (
      product.images.hero ||
      product.images.front ||
      product.images.leftQuarter ||
      product.images.left ||
      product.images.right ||
      product.images.back ||
      product.altImages?.[0] ||
      '/placeholder.svg'
    );
  };

  const getUniqueColors = (product: MomentecProduct) => {
    return [...new Set(product.variants.map(v => v.colorName).filter(Boolean))];
  };

  // Variant Selector Dialog
  if (showVariantSelector && activeProductForVariants) {
    const uniqueColors = getUniqueColors(activeProductForVariants);
    const currentSelectedVariants = selectedVariantsByProduct[activeProductForVariants.styleNumber] || [];

    return (
      <Dialog open={true} onOpenChange={() => setShowVariantSelector(false)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Select Variants to Import
            </DialogTitle>
            <DialogDescription>
              Choose which variants you want to import for {activeProductForVariants.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 bg-white rounded overflow-hidden border">
                  <Image
                    src={getFirstImage(activeProductForVariants)}
                    alt={activeProductForVariants.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{activeProductForVariants.name}</h3>
                  <p className="text-sm text-muted-foreground">Style: {activeProductForVariants.styleNumber}</p>
                  <p className="text-sm mt-1">
                    {activeProductForVariants.variants.length} total variants available
                  </p>
                </div>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Variants ({currentSelectedVariants.length}/{activeProductForVariants.variants.length})
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllVariants}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllVariants}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Variants Grid grouped by color */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto border rounded-lg p-4">
              {uniqueColors.map(color => {
                const colorVariants = activeProductForVariants.variants.filter(v => v.colorName === color);
                const allColorSelected = colorVariants.every(v => currentSelectedVariants.includes(v.sku));
                
                return (
                  <div key={color} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{color}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (allColorSelected) {
                            const newVariants = currentSelectedVariants.filter(sku => 
                              !colorVariants.some(v => v.sku === sku)
                            );
                            setSelectedVariantsByProduct(prev => ({
                                ...prev,
                                [activeProductForVariants.styleNumber]: newVariants
                            }));
                          } else {
                            const newVariants = [
                              ...currentSelectedVariants.filter(sku => !colorVariants.some(v => v.sku === sku)),
                              ...colorVariants.map(v => v.sku)
                            ];
                            setSelectedVariantsByProduct(prev => ({
                                ...prev,
                                [activeProductForVariants.styleNumber]: newVariants
                            }));
                          }
                        }}
                      >
                        {allColorSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pl-4">
                      {colorVariants.map(variant => (
                        <Button
                          key={variant.sku}
                          type="button"
                          variant={currentSelectedVariants.includes(variant.sku) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleVariant(variant.sku)}
                          className="justify-start text-xs h-8"
                        >
                          {currentSelectedVariants.includes(variant.sku) && <Check className="h-3 w-3 mr-1" />}
                          {variant.sizeName}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowVariantSelector(false);
                  setActiveProductForVariants(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>Import from Momentec Brands</DialogTitle>
              <DialogDescription>
                Search for products by style number and import to your catalog
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Section */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Style Numbers</Label>
            <div className="flex flex-col gap-2">
              <Textarea
                id="search-query"
                placeholder="Enter style numbers (one per line or comma separated)&#10;e.g., 790, 880, 123"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto self-end">
                {searching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter Momentec style numbers to search for multiple products at once.
            </p>
          </div>

          {/* Results Section */}
          {products.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Search Results ({products.length})</Label>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProducts(products)}>Select All</Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProducts([])}>Deselect All</Button>
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {products.map((product, index) => {
                  const isSelected = selectedProducts.some(p => p.styleNumber === product.styleNumber);
                  const selectedVariantCount = (selectedVariantsByProduct[product.styleNumber] || []).length;
                  
                  return (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleProductSelection(product)}
                        className="mt-1"
                      />
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden border cursor-pointer" onClick={() => toggleProductSelection(product)}>
                        <Image
                          src={getFirstImage(product)}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                            <h4 className="font-semibold cursor-pointer" onClick={() => toggleProductSelection(product)}>{product.name}</h4>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveProductForVariants(product);
                                    setShowVariantSelector(true);
                                }}
                            >
                                Edit Variants
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Style: {product.styleNumber}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            {product.msrp.currency} {product.msrp.value}
                          </Badge>
                          <Badge variant={selectedVariantCount > 0 ? "secondary" : "destructive"}>
                            {selectedVariantCount}/{product.variants.length} variants
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Import Summary & Category Selection */}
          {selectedProducts.length > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Import Summary</Label>
                <Badge variant="default" className="gap-1">
                  {selectedProducts.length} Products Selected
                </Badge>
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="import-category">Category for all products</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger id="import-category" className="bg-background">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              
              {importing && (
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span>Importing...</span>
                          <span>{importProgress.current} / {importProgress.total}</span>
                      </div>
                      <Progress value={(importProgress.current / importProgress.total) * 100} />
                      <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="text-green-600">Success: {importProgress.success}</span>
                          <span className="text-red-600">Failed: {importProgress.failed}</span>
                      </div>
                  </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.open('https://www.momentecbrands.ca', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Browse Momentec Catalog
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkImport}
                disabled={selectedProducts.length === 0 || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Import {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
