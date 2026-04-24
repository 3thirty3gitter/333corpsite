export interface MarkupRule {
  id: string;
  supplier: string;
  category: string;
  markup_percent: number;
  markup_flat: number;
  priority: number;
}

/**
 * Calculates the retail price based on cost and applicable markup rules.
 * Rules are prioritized:
 * 1. Supplier-specific + Category-specific
 * 2. Supplier-specific + 'all' category
 * 3. 'all' supplier + Category-specific
 * 4. 'all' supplier + 'all' category (Default)
 */
export function calculateRetailPrice(
  costPrice: number,
  supplier: string,
  category: string,
  rules: MarkupRule[]
): number {
  if (!costPrice || isNaN(costPrice)) return 0;
  
  // Rules are already sorted by priority from API
  // Find the best matching rule
  let bestRule = rules.find(r => r.supplier === supplier && r.category === category);
  
  if (!bestRule) {
    bestRule = rules.find(r => r.supplier === supplier && r.category === 'all');
  }
  
  if (!bestRule) {
    bestRule = rules.find(r => r.supplier === 'all' && r.category === category);
  }
  
  if (!bestRule) {
    bestRule = rules.find(r => r.supplier === 'all' && r.category === 'all');
  }

  if (!bestRule) return costPrice;

  // Apply both percentage and flat markups if they exist
  let retailPrice = costPrice;
  
  if (bestRule.markup_percent) {
    retailPrice = retailPrice * (1 + (Number(bestRule.markup_percent) / 100));
  }
  
  if (bestRule.markup_flat) {
    retailPrice = retailPrice + Number(bestRule.markup_flat);
  }

  return retailPrice;
}

export function formatPrice(price: number, currency: string = 'CAD'): string {
  return `${currency} $${price.toFixed(2)}`;
}
