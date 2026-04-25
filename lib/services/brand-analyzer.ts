import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface BrandAnalysis {
  categories: Array<{
    name: string;
    description: string;
  }>;
}

export async function analyzeBrand(
  brandName: string,
  website: string,
  description?: string
): Promise<BrandAnalysis> {
  const prompt = `Analyze this brand and extract its product categories:

Brand Name: ${brandName}
Website: ${website}
${description ? `Description: ${description}` : ''}

Based on the brand information above, identify 3-7 main product categories this brand sells.
For each category, provide:
1. A clear category name (e.g., "Sneakers", "Running Shoes", "Sustainable Fashion")
2. A brief description of what products are in this category

Return ONLY a JSON object in this exact format:
{
  "categories": [
    {"name": "Category Name", "description": "Brief description"},
    ...
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse brand analysis response');
  }

  return JSON.parse(jsonMatch[0]);
}
