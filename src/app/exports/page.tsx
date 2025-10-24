export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
        <p className="text-muted-foreground">
          Export your insights in various formats.
        </p>
      </div>

      {/* TODO: Add export functionality */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Export Options</h3>
        <p className="text-sm text-muted-foreground">
          Export functionality will be implemented here. Users will be able to
          export their insights as JSON, CSV, PDF, and other formats.
        </p>
      </div>
    </div>
  )
}
