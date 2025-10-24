export default function InsightPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insight Details</h1>
        <p className="text-muted-foreground">
          View and manage individual insights.
        </p>
      </div>

      {/* TODO: Add insight viewer */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Insight Content</h3>
        <p className="text-sm text-muted-foreground">
          Individual insight details and versions will be displayed here.
        </p>
      </div>
    </div>
  )
}
