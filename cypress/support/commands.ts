/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to bypass authentication
       */
      bypassAuth(): Chainable<void>
    }
  }
}

Cypress.Commands.add('bypassAuth', () => {
  // Set environment variable to bypass auth
  cy.window().then((win) => {
    // @ts-ignore
    win.NEXT_PUBLIC_DISABLE_AUTH = true
  })
})

export {}
