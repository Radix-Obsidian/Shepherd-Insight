// App constants
export const APP_NAME = 'Shepherd Insight'
export const APP_TAGLINE = 'From idea to clarity in minutes.'

// Navigation items - The Shepherd Journey
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  // The Shepherd Journey: Compass → Muse → Blueprint
  { name: 'Compass', href: '/compass', description: 'Find Clarity' },
  { name: 'Muse', href: '/muse', description: 'Understand Deeply' },
  { name: 'Blueprint', href: '/blueprint', description: 'Know What to Build' },
  // Legacy tools (to be deprecated)
  { name: 'New Insight', href: '/intake', legacy: true },
  { name: 'Vault', href: '/vault', legacy: true },
  { name: 'Mind Map', href: '/mindmap', legacy: true },
  { name: 'Exports', href: '/exports' },
  { name: 'Account', href: '/account' },
]

// Default values
export const DEFAULT_SIDEBAR_WIDTH = 240
