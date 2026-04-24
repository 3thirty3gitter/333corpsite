export const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  'Business Cards': 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&q=80&w=800',
  'Flyers': 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=800',
  'Postcards': 'https://images.unsplash.com/photo-1523944339743-0fe06f079939?auto=format&fit=crop&q=80&w=800',
  'Brochures': 'https://images.unsplash.com/photo-1544265852-a134dd72a50a?auto=format&fit=crop&q=80&w=800',
  'Letterhead': 'https://images.unsplash.com/photo-1586075010633-2a420b9fd08a?auto=format&fit=crop&q=80&w=800',
  'Envelopes': 'https://images.unsplash.com/photo-1596633605700-1fdc97a6a011?auto=format&fit=crop&q=80&w=800',
  'Signage': 'https://images.unsplash.com/photo-1553152531-b98a2fc8d3bf?auto=format&fit=crop&q=80&w=800',
  'Stickers': 'https://images.unsplash.com/photo-1572375927084-550ef8a58686?auto=format&fit=crop&q=80&w=800',
  'Default': 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800',
};

export function getPlaceholderForCategory(category?: string | null): string {
  if (!category) return CATEGORY_PLACEHOLDERS['Default'];
  
  // Try exact match
  if (CATEGORY_PLACEHOLDERS[category]) {
    return CATEGORY_PLACEHOLDERS[category];
  }
  
  // Try partial match
  const lowerCat = category.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (lowerCat.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return CATEGORY_PLACEHOLDERS['Default'];
}
