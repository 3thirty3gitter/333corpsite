import { NextResponse } from 'next/server';
import type { SuggestProductInput } from '@/ai/flows/suggest-product-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body as SuggestProductInput;
    // Dynamically import the server-only flow to avoid bundling server-only libraries into client builds
    const { suggestProduct } = await import('@/ai/flows/suggest-product-flow');
    const output = await suggestProduct(input);
    return NextResponse.json(output);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to suggest products' }, { status: 500 });
  }
}
