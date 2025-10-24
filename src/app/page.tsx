import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Shepherd Insight
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          From idea to clarity in minutes. Transform your thoughts into actionable insights.
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          href="/intake"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
