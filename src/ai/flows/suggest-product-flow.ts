'use server';
/**
 * @fileOverview An AI flow to suggest new product names.
 *
 * - suggestProduct - A function that suggests product names based on a business description.
 * - SuggestProductInput - The input type for the suggestProduct function.
 * - SuggestProductOutput - The return type for the suggestProduct function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestProductInputSchema = z.object({
  businessDescription: z.string().describe('A description of the business need or problem to solve.'),
});
export type SuggestProductInput = z.infer<typeof SuggestProductInputSchema>;

const SuggestProductOutputSchema = z.object({
  suggestions: z.array(z.object({
    name: z.string().describe('The suggested product name. It MUST end with the word "Pilot".'),
    description: z.string().describe('A brief, compelling description of what this product does.'),
  })).describe('A list of 3-5 product name suggestions.'),
});
export type SuggestProductOutput = z.infer<typeof SuggestProductOutputSchema>;


const prompt = ai.definePrompt({
  name: 'suggestProductPrompt',
  input: { schema: SuggestProductInputSchema },
  output: { schema: SuggestProductOutputSchema },
  prompt: `You are a branding expert for a SaaS company called "3Thirty3 Solutions".
  
The company has a "Pilot Suite" of products. All products have a name that ends with "Pilot", for example: PrintPilot, StickerPilot, TimePilot.

Your task is to generate creative, brand-aligned product names for a new software product based on the user's business description.

Business Description:
{{{businessDescription}}}

Generate a list of 3 to 5 unique product names. Each name must end with "Pilot".
For each name, provide a short, one-sentence description that explains what the product does.
The name should be a single word ending in "Pilot", like "SupportPilot" or "InventoryPilot".
The tone should be professional, modern, and trustworthy.
`,
});

const suggestProductFlow = ai.defineFlow(
  {
    name: 'suggestProductFlow',
    inputSchema: SuggestProductInputSchema,
    outputSchema: SuggestProductOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function suggestProduct(input: SuggestProductInput): Promise<SuggestProductOutput> {
  return suggestProductFlow(input);
}