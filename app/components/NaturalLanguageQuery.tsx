'use client';

import { useState } from 'react';
import { Search, Database, Loader2 } from 'lucide-react';

interface QueryResult {
  success: boolean;
  originalQuery: string;
  sqlQuery: string;
  results: Record<string, string | number | boolean | null>[];
  message: string;
  error?: string;
}

export default function NaturalLanguageQuery() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error processing query:', error);
      setResult({
        success: false,
        originalQuery: query,
        sqlQuery: '',
        results: [],
        message: '',
        error: 'Failed to process query'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    "Show me all products that expire in the next 7 days",
    "Which products have the highest quantity?",
    "Find all dead stock products",
    "Show me the warehouse capacity utilization",
    "List all orders from the last 30 days",
    "Which products are at risk of becoming dead stock?"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Natural Language Query</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Ask questions about your warehouse data in plain English. The AI will convert your question to SQL and show you the results.
        </p>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your warehouse data..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              {isLoading ? 'Processing...' : 'Query'}
            </button>
          </div>
        </form>

        {/* Example Queries */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Example Queries:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Database className={`h-5 w-5 ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Query Successful' : 'Query Failed'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Your Question:</p>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                    &quot;{result.originalQuery}&quot;
                  </p>
                </div>

                {result.sqlQuery && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Generated SQL:</p>
                    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                      {result.sqlQuery}
                    </pre>
                  </div>
                )}

                {result.error && (
                  <div>
                    <p className="text-sm font-medium text-red-700">Error:</p>
                    <p className="text-sm text-red-600">{result.error}</p>
                  </div>
                )}

                {result.message && (
                  <p className="text-sm text-gray-600">{result.message}</p>
                )}
              </div>
            </div>

            {/* Results Table */}
            {result.success && result.results && result.results.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Query Results</h3>
                  <p className="text-sm text-gray-600">
                    {result.results.length} row{result.results.length !== 1 ? 's' : ''} returned
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(result.results[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.results.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-3 text-sm text-gray-900"
                            >
                              {typeof value === 'object' && value !== null
                                ? JSON.stringify(value)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.success && result.results && result.results.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No results found for your query.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
