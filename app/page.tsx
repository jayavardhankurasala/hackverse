import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <main className="text-center max-w-3xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          CAMPUS SERVICE REQUEST PLATFORM
        </h1>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          Report. Track. Resolve.
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          "A centralized platform for reporting, managing, and resolving campus service requests."
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login?role=student"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Student Login
          </Link>
          <Link 
            href="/login?role=staff"
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Staff Login
          </Link>
          <Link 
            href="/login?role=admin"
            className="w-full sm:w-auto px-8 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </main>
    </div>
  );
}
