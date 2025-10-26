describe('Debug Test', () => {
  it('should load the intake page and show what we see', () => {
    cy.visit('/intake')
    
    // Wait for page to load
    cy.wait(2000)
    
    // Take a screenshot to see what's on the page
    cy.screenshot('debug-intake-page')
    
    // Log the page title
    cy.title().then((title) => {
      cy.log('Page title:', title)
    })
    
    // Log all h1 elements
    cy.get('h1').then(($h1s) => {
      cy.log('Found h1 elements:', $h1s.length)
      $h1s.each((i, el) => {
        cy.log(`h1[${i}]:`, el.textContent)
      })
    })
    
    // Log all buttons
    cy.get('button').then(($buttons) => {
      cy.log('Found buttons:', $buttons.length)
      $buttons.each((i, el) => {
        cy.log(`button[${i}]:`, el.textContent, el.getAttribute('data-testid'))
      })
    })
  })
})
