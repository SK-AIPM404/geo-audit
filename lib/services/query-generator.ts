import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface GeneratedQueries {
  queries: Array<{
    text: string;
    category: string;
    intent: string; // discovery, comparison, purchase
  }>;
}

export async function generateQueries(
  brandName: string,
  categories: Array<{ name: string; description: string }>
): Promise<GeneratedQueries> {
  const categoriesList = categories
    .map((c) => `- ${c.name}: ${c.description}`)
    .join('\n');

  const prompt = `Generate realistic search queries that users might ask AI search engines (ChatGPT, Perplexity, Gemini) when looking for products in these categories:

Brand: ${brandName}
Categories:
${categoriesList}

Generate 3-5 queries for EACH category. The queries should be:
1. Natural language questions (how people actually talk to AI)
2. Mix of different intents:
   - discovery ("what are the best...", "recommend...")
   - comparison ("X vs Y", "better than...")
   - purchase ("where to buy...", "top rated...")
3. Varied phrasing and specificity

Examples of good queries:
- "recommend sustainable sneaker brands in India"
- "best running shoes for beginners under 5000 rupees"
- "Nike vs local Indian sneaker brands comparison"
- "where to buy eco-friendly footwear online"

Return ONLY a JSON object in this exact format:
{
  "queries": [
    {"text": "query text here", "category": "Category Name", "intent": "discovery|comparison|purchase"},
    ...
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse query generation response');
  }

  return JSON.parse(jsonMatch[0]);
}
