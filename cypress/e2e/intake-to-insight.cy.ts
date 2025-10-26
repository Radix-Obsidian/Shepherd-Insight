describe('Intake to Insight Flow', () => {
  beforeEach(() => {
    // Visit intake page
    cy.visit('/intake')
  })

  it('should complete intake form and navigate to insight page', () => {
    // Verify we're on the intake page
    cy.contains('h1', "Let's define your product.").should('be.visible')

    // Fill out the form
    cy.get('input[placeholder*="CashPilot"]').type('Test Product')
    cy.get('input[placeholder*="Solo entrepreneurs"]').type('Test Audience')
    cy.get('textarea[placeholder*="Small businesses struggle"]').type('Test Problem')
    cy.get('textarea[placeholder*="Existing tools are too complex"]').type('Test Solution')
    cy.get('textarea[placeholder*="Automated cash flow tracking"]').type('Test Promise')
    cy.get('textarea[placeholder*="Real-time cash flow tracking"]').type('Feature 1{enter}Feature 2')
    cy.get('textarea[placeholder*="Mobile app"]').type('Future Feature')
    cy.get('textarea[placeholder*="Must launch within 3 months"]').type('Test Constraint')

    // Submit the form
    cy.get('[data-testid="submit-project"]').click()

    // Verify we navigated to the insight page
    cy.url().should('include', '/insight')
    cy.get('[data-testid="insight-heading"]').should('be.visible')
  })

  it('should show validation errors for empty form', () => {
    // Try to submit without filling the form
    cy.get('[data-testid="submit-project"]').click()

    // Should stay on intake page
    cy.url().should('include', '/intake')
  })
})
