export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* TODO: Add account management */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Account management features will be implemented here including
          profile settings, API keys, and authentication options.
        </p>
      </div>
    </div>
  )
}
