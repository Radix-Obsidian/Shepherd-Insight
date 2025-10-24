export default function VaultPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vault</h1>
        <p className="text-muted-foreground">
          Browse and search through all your saved insights and projects.
        </p>
      </div>

      {/* TODO: Add vault/search functionality */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Project Library</h3>
        <p className="text-sm text-muted-foreground">
          Search and browse functionality will be implemented here.
          Users will be able to find and manage their saved projects.
        </p>
      </div>
    </div>
  )
}
