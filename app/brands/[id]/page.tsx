'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Citation {
  id: string;
  aiEngine: string;
  response: string;
  brandMentioned: boolean;
  brandPosition: number | null;
  competitors: string;
  createdAt: string;
}

interface Query {
  id: string;
  text: string;
  status: string;
  citations: Citation[];
  category: { name: string } | null;
}

interface Brand {
  id: string;
  name: string;
  website: string;
  description: string | null;
  queries: Query[];
  citations: Citation[];
}

export default function BrandPage() {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'citations'>('overview');

  useEffect(() => {
    fetchBrand();
  }, [brandId]);

  async function fetchBrand() {
    try {
      const res = await fetch(`/api/brands/${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setBrand(data);
      }
    } catch (error) {
      console.error('Failed to fetch brand:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckCitation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!queryText.trim()) return;

    setChecking(true);
    try {
      const res = await fetch(`/api/brands/${brandId}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });
      if (res.ok) {
        setQueryText('');
        fetchBrand();
      }
    } catch (error) {
      console.error('Failed to check citation:', error);
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-zinc-500 mb-4">Brand not found</div>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCitations = brand.citations.length;
  const mentionedCount = brand.citations.filter((c) => c.brandMentioned).length;
  const mentionRate = totalCitations > 0 ? Math.round((mentionedCount / totalCitations) * 100) : 0;

  // Get all competitors
  const competitorCounts: Record<string, number> = {};
  brand.citations.forEach((c) => {
    try {
      const competitors = JSON.parse(c.competitors || '[]');
      competitors.forEach((comp: string) => {
        competitorCounts[comp] = (competitorCounts[comp] || 0) + 1;
      });
    } catch {
      // ignore parse errors
    }
  });
  const topCompetitors = Object.entries(competitorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-400 mb-2 inline-block">
            ← Back to brands
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">{brand.name}</h1>
              <p className="text-sm text-zinc-500">{brand.website}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="border-b border-zinc-800 px-6 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-semibold text-white">{brand.queries.length}</div>
            <div className="text-sm text-zinc-500">Queries Tracked</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-semibold text-white">{totalCitations}</div>
            <div className="text-sm text-zinc-500">Total Checks</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-semibold text-emerald-400">{mentionRate}%</div>
            <div className="text-sm text-zinc-500">Mention Rate</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-3xl font-semibold text-amber-400">{topCompetitors.length}</div>
            <div className="text-sm text-zinc-500">Competitors Found</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Query Input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Check AI Citation</h2>
          <form onSubmit={handleCheckCitation} className="flex gap-4">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Enter a search query, e.g. 'best sneakers for running in India'"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={checking || !queryText.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors"
            >
              {checking ? 'Checking...' : 'Check Citation'}
            </button>
          </form>
          <p className="text-sm text-zinc-500 mt-2">
            This will query ChatGPT and Perplexity to see if your brand is mentioned.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'queries', 'citations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Citations */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Recent Checks</h3>
              {brand.citations.length === 0 ? (
                <p className="text-zinc-500 text-sm">No citations checked yet</p>
              ) : (
                <div className="space-y-3">
                  {brand.citations.slice(0, 5).map((citation) => (
                    <div
                      key={citation.id}
                      className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            citation.brandMentioned ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        <span className="text-sm text-zinc-400 capitalize">
                          {citation.aiEngine}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-600">
                        {new Date(citation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Competitors */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Top Competitors</h3>
              {topCompetitors.length === 0 ? (
                <p className="text-zinc-500 text-sm">No competitors found yet</p>
              ) : (
                <div className="space-y-3">
                  {topCompetitors.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                    >
                      <span className="text-sm text-zinc-300">{name}</span>
                      <span className="text-xs text-zinc-500">{count} mentions</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="space-y-4">
            {brand.queries.length === 0 ? (
              <p className="text-zinc-500">No queries yet. Enter a query above to get started.</p>
            ) : (
              brand.queries.map((query) => (
                <div
                  key={query.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-medium">{query.text}</p>
                      {query.category && (
                        <span className="text-xs text-zinc-500 mt-1 inline-block">
                          {query.category.name}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        query.status === 'completed'
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : query.status === 'running'
                          ? 'bg-amber-900/50 text-amber-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {query.status}
                    </span>
                  </div>
                  {query.citations.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {query.citations.map((citation) => (
                        <div
                          key={citation.id}
                          className="bg-zinc-800 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize text-zinc-300">
                              {citation.aiEngine}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                citation.brandMentioned
                                  ? 'bg-emerald-900/50 text-emerald-400'
                                  : 'bg-red-900/50 text-red-400'
                              }`}
                            >
                              {citation.brandMentioned ? 'Mentioned' : 'Not Mentioned'}
                            </span>
                          </div>
                          {citation.brandMentioned && citation.brandPosition && (
                            <p className="text-xs text-zinc-500">
                              Position: #{citation.brandPosition}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="space-y-4">
            {brand.citations.length === 0 ? (
              <p className="text-zinc-500">No citations yet.</p>
            ) : (
              brand.citations.map((citation) => (
                <div
                  key={citation.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium capitalize text-white">
                        {citation.aiEngine}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          citation.brandMentioned
                            ? 'bg-emerald-900/50 text-emerald-400'
                            : 'bg-red-900/50 text-red-400'
                        }`}
                      >
                        {citation.brandMentioned ? 'Mentioned' : 'Not Mentioned'}
                      </span>
                      {citation.brandPosition && (
                        <span className="text-xs text-zinc-500">
                          Position #{citation.brandPosition}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600">
                      {new Date(citation.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-zinc-400 whitespace-pre-wrap">
                      {citation.response}
                    </p>
                  </div>
                  {citation.competitors && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {JSON.parse(citation.competitors || '[]').map((comp: string) => (
                        <span
                          key={comp}
                          className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
