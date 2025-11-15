import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-svh bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Not Found</h1>
        <p className="text-gray-600 mb-8">The book you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

