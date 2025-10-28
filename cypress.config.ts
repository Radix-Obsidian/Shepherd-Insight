import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Use environment variable for base URL (supports cloud testing)
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config
    },
    env: {
      NEXT_PUBLIC_DISABLE_AUTH: 'true',
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000, // Increase for cloud testing
    requestTimeout: 15000,
    responseTimeout: 15000,
  },
})
