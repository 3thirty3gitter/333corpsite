'use client';

import * as React from 'react';
import { Loader2, Calculator, Info, Truck, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface Option {
  id: number;
  name: string;
  hidden: boolean;
}

interface SinaLitePricingCalculatorProps {
  productId: string; // The source_id
  dbProductId: string; // The internal UUID
  options: Record<string, Option[]>;
  initialPrice?: string;
}

export function SinaLitePricingCalculator({ 
  productId, 
  dbProductId,
  options, 
  initialPrice 
}: SinaLitePricingCalculatorProps) {
  const { session } = useSupabaseAuth();
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, number>>({});
  const [pricing, setPricing] = React.useState<any>(null);
  const [shippingRates, setShippingRates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingShipping, setLoadingShipping] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Shipping state
  const [shipZip, setShipZip] = React.useState('L3R 1G3');
  const [shipState, setShipState] = React.useState('ON');
  const [shipCountry, setShipCountry] = React.useState('CA');

  // Initialize selected options with the first visible option from each group
  React.useEffect(() => {
    const initial: Record<string, number> = {};
    Object.entries(options).forEach(([group, items]) => {
      const firstVisible = items.find(opt => !opt.hidden);
      if (firstVisible) {
        initial[group] = firstVisible.id;
      }
    });
    setSelectedOptions(initial);
  }, [options]);

  // Fetch pricing when selections change
  React.useEffect(() => {
    const optionIds = Object.values(selectedOptions);
    if (optionIds.length === 0 || optionIds.length < Object.keys(options).length) {
      return;
    }

    async function fetchPricing() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/suppliers/sinalite/pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            productId: parseInt(productId, 10),
            productOptions: optionIds,
          }),
        });

        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
          setPricing(null);
        } else {
          setPricing(data.pricing);
        }
      } catch (err) {
        setError('Failed to fetch pricing');
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchPricing();
    }, 500);

    return () => clearTimeout(timer);
  }, [productId, selectedOptions, options, session]);

  // Fetch shipping estimates
  const fetchShipping = async () => {
    try {
      setLoadingShipping(true);
      const stringOptions: Record<string, string> = {};
      Object.entries(selectedOptions).forEach(([k, v]) => {
        stringOptions[k] = v.toString();
      });

      const res = await fetch('/api/suppliers/sinalite/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          productId: parseInt(productId, 10),
          options: stringOptions,
          shippingInfo: {
            ShipZip: shipZip,
            ShipState: shipState,
            ShipCountry: shipCountry,
          }
        }),
      });

      const data = await res.json();
      if (data.rates) {
        setShippingRates(data.rates);
      }
    } catch (err) {
      console.error('Failed to fetch shipping:', err);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Fetch shipping when pricing is loaded or zip changes (debounced)
  React.useEffect(() => {
    if (pricing && shipZip.length >= 3) {
      const timer = setTimeout(fetchShipping, 1000);
      return () => clearTimeout(timer);
    }
  }, [pricing, shipZip, shipState, shipCountry]);

  const handleOptionChange = (group: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [group]: parseInt(optionId, 10),
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Price Calculator
        </CardTitle>
        <CardDescription>Select options to get real-time pricing and shipping estimates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(options).map(([group, items]) => (
            <div key={group} className="space-y-2">
              <Label className="text-sm font-semibold">{group}</Label>
              <Select 
                value={selectedOptions[group]?.toString()} 
                onValueChange={(val) => handleOptionChange(group, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${group}`} />
                </SelectTrigger>
                <SelectContent>
                  {items.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Calculating...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {pricing && !loading && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Price (excl. tax)</p>
                <p className="text-3xl font-bold text-primary">
                  ${parseFloat(pricing.price).toFixed(2)} 
                  <span className="text-sm font-normal text-muted-foreground ml-1">CAD</span>
                </p>
              </div>
              <Badge variant="outline" className="mb-2">
                Est. Weight: {pricing.packageInfo?.['total weight']} lbs
              </Badge>
            </div>

            <div className="space-y-3 p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Estimate
                </p>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {shipCountry}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Zip/Postal</Label>
                  <Input 
                    value={shipZip} 
                    onChange={(e) => setShipZip(e.target.value)} 
                    className="h-8 text-xs"
                    placeholder="L3R 1G3"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">State/Prov</Label>
                  <Input 
                    value={shipState} 
                    onChange={(e) => setShipState(e.target.value)} 
                    className="h-8 text-xs"
                    placeholder="ON"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Country</Label>
                  <Select value={shipCountry} onValueChange={setShipCountry}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="US">USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loadingShipping ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : shippingRates.length > 0 ? (
                <div className="space-y-1 mt-2">
                  {shippingRates.slice(0, 3).map((rate: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md bg-background/50 text-xs border border-border/50">
                      <div className="flex flex-col">
                        <span className="font-medium">{rate.method}</span>
                        <span className="text-[10px] text-muted-foreground">{rate.carrier} • {rate.days} day(s)</span>
                      </div>
                      <span className="font-bold text-primary">${parseFloat(rate.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-center text-muted-foreground py-2 italic">
                  Enter address to see shipping rates
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex flex-col">
                <span>Boxes: {pricing.packageInfo?.['number of boxes']}</span>
                <span>Units/Box: {pricing.packageInfo?.['Units Per Box']}</span>
              </div>
              <div className="flex flex-col text-right">
                <span>Box Size: {pricing.packageInfo?.['box size']}</span>
                <span>Turnaround: {pricing.productOptions?.['Turnaround']}</span>
              </div>
            </div>
          </div>
        )}

        {!pricing && !loading && !error && initialPrice && (
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold">${parseFloat(initialPrice).toFixed(2)} CAD</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
