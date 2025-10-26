describe('Navigation', () => {
  it('should navigate between pages without authentication', () => {
    // Visit dashboard
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')

    // Navigate to intake
    cy.contains('New Insight').click()
    cy.url().should('include', '/intake')

    // Navigate to vault
    cy.contains('Vault').click()
    cy.url().should('include', '/vault')

    // Navigate to mind map
    cy.contains('Mind Map').click()
    cy.url().should('include', '/mindmap')

    // Navigate to exports
    cy.contains('Exports').click()
    cy.url().should('include', '/exports')
  })
})
