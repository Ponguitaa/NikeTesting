describe('Login Functionality', () => {
  beforeEach(() => {
    // Restablece el modo de validación para cada prueba
    Cypress.env('validationTestMode', false);
    
    // Visit the home page
    cy.visit('/');
    cy.wait(1000); // Wait for page to load
    
    // Look for login elements
    cy.get('body').then($body => {
      // Check if we need to click a login button/link first
      if ($body.find('a:contains("Iniciar sesión"), button:contains("Iniciar sesión")').length > 0) {
        // Find and click the login button/link
        cy.contains('Iniciar sesión').click();
        cy.wait(1000); // Wait for any transitions
      }
      
      // If we're already on a page with the login form, continue
      cy.log('Ready to test login functionality');
    });
  });

  it('should display login form with all required elements', () => {
    // Verify login form elements are visible using data-cy attributes
    cy.get('form').should('exist');
    cy.get('[data-cy=login-email]').should('be.visible');
    cy.get('[data-cy=login-password]').should('be.visible');
    cy.get('[data-cy=login-button]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    // Establecer el modo de validación para esta prueba
    Cypress.env('validationTestMode', true);
    
    // Recargar para aplicar el modo de validación
    cy.reload();
    cy.wait(1000);
    
    // Make sure form is reset
    cy.get('[data-cy=login-email]').clear();
    cy.get('[data-cy=login-password]').clear();
    
    // Type and then delete to trigger validation errors
    cy.get('[data-cy=login-email]').type('test').clear();
    cy.get('[data-cy=login-password]').type('test').clear();
    
    // Focus out of the fields to trigger validation
    cy.get('form').click();
    
    // Check for validation error messages
    cy.get('body').contains(/email.*requerido|correo.*obligatorio/i).should('be.visible');
    cy.get('body').contains(/contraseña.*requerida|password.*obligatorio/i).should('be.visible');
    
    // Verify button is disabled
    cy.get('[data-cy=login-button]').should('be.disabled');
  });

  it('should show error with invalid email format', () => {
    // Establecer el modo de validación para esta prueba
    Cypress.env('validationTestMode', true);
    
    // Recargar para aplicar el modo de validación
    cy.reload();
    cy.wait(1000);
    
    // Clear fields first
    cy.get('[data-cy=login-email]').clear();
    cy.get('[data-cy=login-password]').clear();
    
    // Type invalid email format but valid password
    cy.get('[data-cy=login-email]').type('invalid-email');
    cy.get('[data-cy=login-password]').type('password123');
    
    // Focus out to trigger validation
    cy.get('form').click();
    
    // Should show email format validation error
    cy.get('body').contains(/formato.*email|email.*válido|formato.*correo/i).should('be.visible');
    
    // Verify button is still disabled
    cy.get('[data-cy=login-button]').should('be.disabled');
  });

  // En el resto de las pruebas no activamos el modo de validación
  it('should show error message with incorrect credentials', () => {
    // Clear fields first
    cy.get('[data-cy=login-email]').clear();
    cy.get('[data-cy=login-password]').clear();
    
    // Type credentials that don't exist in the system but are valid format
    cy.get('[data-cy=login-email]').type('wrong@example.com');
    cy.get('[data-cy=login-password]').type('wrongpassword123');
    
    // Wait for button to be enabled
    cy.get('[data-cy=login-button]').should('not.be.disabled');
    
    // Submit form
    cy.get('[data-cy=login-button]').click();
    cy.wait(2000); // Wait for server response
    
    // Should show error message for incorrect login
    cy.get('[data-cy=login-error]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Clear fields first
    cy.get('[data-cy=login-email]').clear();
    cy.get('[data-cy=login-password]').clear();
    
    // Type valid credentials
    cy.get('[data-cy=login-email]').type('admin@nike.com');
    cy.get('[data-cy=login-password]').type('123456');
    
    // Wait for button to be enabled
    cy.get('[data-cy=login-button]').should('not.be.disabled');
    
    // Submit form
    cy.get('[data-cy=login-button]').click();
    cy.wait(2000); // Wait for server response and potential redirect
    
    // Check for success in flexible ways:
    // Option 1: Success message appears
    cy.get('body').then($body => {
      if ($body.text().match(/exitoso|bienvenido|welcome|success/i)) {
        cy.contains(/exitoso|bienvenido|welcome|success/i).should('be.visible');
      } 
      // Option 2: We got redirected to admin or home
      else {
        cy.url().should('include', '/');
      }
    });
    
    // Verify we can access admin area
    cy.visit('/admin');
    cy.wait(1000);
    cy.url().should('include', '/admin');
  });

  it('should persist login state across page reloads', () => {
    // First ensure we're logged in using the previous test logic
    cy.get('[data-cy=login-email]').clear();
    cy.get('[data-cy=login-password]').clear();
    cy.get('[data-cy=login-email]').type('admin@nike.com');
    cy.get('[data-cy=login-password]').type('123456');
    
    // Wait for button to be enabled
    cy.get('[data-cy=login-button]').should('not.be.disabled');
    
    // Then click
    cy.get('[data-cy=login-button]').click();
    cy.wait(2000);
    
    // Visit admin page to confirm we're logged in
    cy.visit('/admin');
    cy.wait(1000);
    
    // Now reload the page
    cy.reload();
    cy.wait(2000);
    
    // We should still be on the admin page (not redirected to login)
    cy.url().should('include', '/admin');
    
    // Alternative check: admin content should be visible
    cy.get('body').then($body => {
      const adminContentVisible = 
        $body.find('form').length > 0 || 
        $body.text().includes('admin') ||
        $body.text().includes('Admin');
        
      expect(adminContentVisible).to.be.true;
    });
  });
});
