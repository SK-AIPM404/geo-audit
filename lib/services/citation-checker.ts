import OpenAI from 'openai';

// OpenRouter client - access all models with one API key
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
});

export interface CitationResult {
  aiEngine: string;
  response: string;
  brandMentioned: boolean;
  brandPosition: number | null;
  competitors: string[];
}

async function queryModel(model: string, query: string): Promise<string> {
  try {
    const completion = await openrouter.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error(`Error querying ${model}:`, error);
    return '';
  }
}

async function queryChatGPT(query: string): Promise<string> {
  return queryModel('openai/gpt-4o', query);
}

async function queryPerplexity(query: string): Promise<string> {
  return queryModel('perplexity/llama-3.1-sonar-large-128k-online', query);
}

async function queryGemini(query: string): Promise<string> {
  return queryModel('google/gemini-2.0-flash-001', query);
}

async function analyzeCitation(
  brandName: string,
  query: string,
  response: string
): Promise<{
  brandMentioned: boolean;
  brandPosition: number | null;
  competitors: string[];
}> {
  const analysisPrompt = `Analyze this AI search engine response for brand mentions and competitors:

Query: "${query}"
Brand to check: ${brandName}
Response to analyze:
"""
${response}
"""

Determine:
1. Is the brand "${brandName}" mentioned in the response? (Check for exact name or common variations)
2. If mentioned, at what position (1-10, where 1 is most prominent)?
3. What competitor brands are mentioned? (Extract all brand names mentioned)

Return ONLY a JSON object in this exact format:
{
  "brandMentioned": true/false,
  "brandPosition": number or null,
  "competitors": ["Brand 1", "Brand 2", ...]
}`;

  // Use Claude via OpenRouter for analysis
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-sonnet-4',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
  });

  const responseText = completion.choices[0]?.message?.content || '';

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse citation analysis response');
  }

  return JSON.parse(jsonMatch[0]);
}

export async function checkCitations(
  brandName: string,
  query: string,
  engines: string[] = ['chatgpt', 'perplexity', 'gemini']
): Promise<CitationResult[]> {
  const results: CitationResult[] = [];

  for (const engine of engines) {
    let response = '';

    try {
      if (engine === 'chatgpt') {
        response = await queryChatGPT(query);
      } else if (engine === 'perplexity') {
        response = await queryPerplexity(query);
      } else if (engine === 'gemini') {
        response = await queryGemini(query);
      }

      if (response) {
        const analysis = await analyzeCitation(brandName, query, response);

        results.push({
          aiEngine: engine,
          response,
          ...analysis,
        });
      }
    } catch (error) {
      console.error(`Error checking ${engine}:`, error);
    }
  }

  return results;
}
