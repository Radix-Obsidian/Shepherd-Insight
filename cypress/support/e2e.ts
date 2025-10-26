// Import commands
import './commands'

// Set auth bypass before each test
beforeEach(() => {
  // Intercept and modify environment variables
  cy.window().then((win) => {
    // @ts-ignore
    win.NEXT_PUBLIC_DISABLE_AUTH = true
  })
})
