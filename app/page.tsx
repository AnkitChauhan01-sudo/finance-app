import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  // bg-gradient-to-br is correct Tailwind class (linter warning is false positive)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            💰 Finance Tracker
          </div>
          <div className="flex gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Take Control of Your
            <span className="text-blue-600 dark:text-blue-400"> Finances</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Track your income and expenses, manage budgets, and visualize your financial
            health with beautiful charts and insights.
          </p>
          <SignedOut>
            <div className="flex gap-4 justify-center">
              <SignUpButton mode="modal">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                  Start Free
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Track Transactions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Easily add and categorize your income and expense transactions with a simple,
              intuitive interface.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Visual Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              View your financial data through beautiful pie and bar charts to understand
              your spending patterns.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Budget Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set and manage budgets for different categories to stay on track with your
              financial goals.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 dark:bg-blue-700 rounded-2xl p-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to improve your finances?
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of users who are taking control of their money.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started for Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
