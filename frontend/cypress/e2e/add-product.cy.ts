describe('Add Product Form', () => {
  beforeEach(() => {
    // Start by visiting the home page
    cy.visit('/');
    
    // Wait for page to be fully loaded
    cy.get('body').should('be.visible');
    cy.log('Home page loaded');

    // Skip login if we're already on the admin page
    cy.url().then(url => {
      if (url.includes('/admin')) {
        cy.log('Already on admin page');
        return;
      }
      
      // Try to find login link or button and click it
      cy.get('body').then($body => {
        if ($body.find('a:contains("Iniciar sesión"), button:contains("Iniciar sesión")').length > 0) {
          cy.contains('Iniciar sesión').click();
          cy.log('Clicked login link/button');
          cy.wait(1000);
        } else {
          // If no login link is found, try to navigate directly
          cy.visit('/admin');
          cy.log('Directly navigated to admin');
          // If redirected to login, we should be able to proceed
        }
      });
      
      // Wait for potential login form to appear
      cy.wait(1000);
      
      // Check if login form exists and fill it
      cy.get('body').then($body => {
        if ($body.find('input[formControlName="email"]').length > 0) {
          cy.log('Login form found, attempting to login');
          
          // Login with admin credentials
          cy.get('input[formControlName="email"]').type('admin@nike.com');
          cy.get('input[formControlName="password"]').type('123456');
          cy.get('button[type="submit"]').click();
          
          // Wait for login to complete
          cy.wait(2000);
        } else {
          cy.log('No login form found, may already be logged in');
        }
      });
      
      // Navigate to admin page
      cy.visit('/admin');
      cy.wait(2000);
    });
  });

  it('should display the add product form with all required fields', () => {
    // Verify form is rendered correctly
    cy.get('form').should('be.visible');
    cy.get('input[formControlName="name"]').should('be.visible');
    cy.get('input[formControlName="price"]').should('be.visible');
    cy.get('input[formControlName="desc"]').should('be.visible');
    cy.get('input[formControlName="reference"]').should('be.visible');
    cy.get('select[formControlName="type"]').should('be.visible');
    cy.get('input[type="file"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors when form is submitted empty', () => {
    // Submit form without filling in any values
    cy.get('button[type="submit"]').should('be.disabled');
    
    // Touch/focus on each field and then blur to trigger validation errors
    cy.get('input[formControlName="name"]').focus().blur();
    cy.get('input[formControlName="price"]').focus().blur();
    cy.get('input[formControlName="desc"]').focus().blur();
    cy.get('input[formControlName="reference"]').focus().blur();
    cy.get('select[formControlName="type"]').focus().blur();
    
    // Check for validation error messages
    cy.contains('El nombre es obligatorio').should('be.visible');
    cy.contains('El precio es obligatorio').should('be.visible');
    cy.contains('La descripción es obligatoria').should('be.visible');
    cy.contains('La referencia es obligatoria').should('be.visible');
    cy.contains('El tipo es obligatorio').should('be.visible');
  });

  it('should successfully add a new product', () => {
    // Generate a unique reference for this test
    const uniqueRef = `TEST-${Date.now()}`;
    
    // Fill in the form with valid data
    cy.get('input[formControlName="name"]').type('Nike Air Max Test');
    cy.get('input[formControlName="price"]').type('149.99');
    cy.get('input[formControlName="desc"]').type('A test product description');
    cy.get('input[formControlName="reference"]').type(uniqueRef);
    cy.get('select[formControlName="type"]').select('casual');
    
    // Ensure form is valid and button is enabled
    cy.get('button[type="submit"]').should('not.be.disabled');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Check for success message
    cy.contains('Producto creado exitosamente').should('be.visible');
  });
});
