import NaturalLanguageQuery from '../components/NaturalLanguageQuery';

export default function QueryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Data Query
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ask questions about your warehouse data in plain English. Our AI will convert your questions to SQL queries and show you the results instantly.
          </p>
        </div>
        
        <NaturalLanguageQuery />
      </div>
    </div>
  );
}
