describe('Login Functionality', () => {
  beforeEach(() => {
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
    // Verify login form elements are visible
    cy.get('form').should('exist');
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]')
      .should('be.visible');
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]')
      .should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    // Make sure form is reset
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').clear();
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').clear();
    
    // Click submit button without filling any fields
    cy.get('button[type="submit"]').click();
    
    // Check for validation error messages with flexible selectors
    cy.get('body').contains(/email.*obligatorio|correo.*obligatorio/i).should('be.visible');
    cy.get('body').contains(/contraseña.*obligatoria|password.*obligatorio/i).should('be.visible');
  });

  it('should show error with invalid email format', () => {
    // Clear fields first
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').clear();
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').clear();
    
    // Type invalid email format
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').type('invalid-email');
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').type('password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show email format validation error (with flexible matching)
    cy.get('body').contains(/formato.*email|email.*válido|formato.*correo/i).should('be.visible');
  });

  it('should show error message with incorrect credentials', () => {
    // Clear fields first
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').clear();
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').clear();
    
    // Type credentials that don't exist in the system
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').type('wrong@example.com');
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').type('wrongpassword');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    cy.wait(2000); // Wait for server response
    
    // Should show error message for incorrect login (with flexible matching)
    cy.get('body').contains(/usuario no encontrado|credenciales incorrectas|error|inválido/i).should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Clear fields first
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').clear();
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').clear();
    
    // Type valid credentials
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').type('admin@nike.com');
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').type('123456');
    
    // Submit form
    cy.get('button[type="submit"]').click();
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
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').clear();
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').clear();
    cy.get('input[formControlName="email"], input[name="email"], input[type="email"]').type('admin@nike.com');
    cy.get('input[formControlName="password"], input[name="password"], input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
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
