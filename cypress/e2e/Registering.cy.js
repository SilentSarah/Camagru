describe('1. Registering', () => {
  const baseUrl = Cypress.env('baseUrl');
  
  const validUser = {
    email: `testuser_${Date.now()}@example.com`,
    fullname: 'Test User',
    username: `testuser_${Date.now()}`,
    password: 'SecurePass123!'
  };

  const waitForToast = (expectedText = null) => {
    cy.wait(500);
    cy.get('#toast-container', { timeout: 10000 }).should('be.visible');
    if (expectedText) {
      cy.get('#toast-container').should('contain.text', expectedText);
    }
  };

  beforeEach(() => {
    cy.visit(`${baseUrl}/signup`);
    cy.get('#register-form').should('be.visible');
  });

  describe('Form Validation - Required Fields', () => {
    it('should show error when submitting empty form', () => {
      cy.get('button[type="submit"]').click();
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should show error when email is missing', () => {
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should show error when fullname is missing', () => {
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="fullname"]:invalid').should('exist');
    });

    it('should show error when username is missing', () => {
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="username"]:invalid').should('exist');
    });

    it('should show error when password is missing', () => {
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="password"]:invalid').should('exist');
    });
  });

  describe('Form Validation - Email Format', () => {
    it('should reject invalid email without @', () => {
      cy.get('input[name="email"]').type('invalidemail');
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should reject invalid email without domain', () => {
      cy.get('input[name="email"]').type('invalid@');
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should show toast error for server-side email validation failure', () => {
      cy.get('input[name="email"]').type('notanemail');
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      
      cy.get('input[name="email"]').invoke('removeAttr', 'type');
      cy.get('button[type="submit"]').click();
      
      waitForToast('email');
    });

    it('should accept valid email format', () => {
      cy.get('input[name="email"]').type('valid@example.com');
      cy.get('input[name="email"]:valid').should('exist');
    });
  });

  describe('Backend Validation - Toast Error Messages', () => {
    it('should show toast when server returns validation error', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: { error: 'The email is not valid', code: 'BAD_REQUEST' }
      }).as('registerRequest');

      cy.get('input[name="email"]').invoke('removeAttr', 'type').type('invalidemail');
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      waitForToast('email');
    });

    it('should show toast when username validation fails', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: { error: 'The minimum length of username must be at least 3 characters long', code: 'BAD_REQUEST' }
      }).as('registerRequest');

      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type('ab');
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      waitForToast();
    });

    it('should show toast when password validation fails', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: { error: 'The password must contain symbols', code: 'BAD_REQUEST' }
      }).as('registerRequest');

      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type('weakpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      waitForToast();
    });
  });

  describe('Form Validation - Input Boundaries', () => {
    it('should show toast for very long username (backend validation)', () => {
      const longUsername = 'a'.repeat(100);
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(longUsername);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
    });

    it('should show toast for single character username', () => {
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type('a');
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
    });
  });

  describe('Form Validation - Special Characters & XSS', () => {
    it('should handle special characters in fullname', () => {
      cy.get('input[name="email"]').type(`test_${Date.now()}@example.com`);
      cy.get('input[name="fullname"]').type("O'Connor-Smith");
      cy.get('input[name="username"]').type(`test_${Date.now()}`);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.contains('Registration Successful', { timeout: 10000 }).should('be.visible');
    });

    it('should sanitize XSS attempts in username', () => {
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type('<script>alert(1)</script>');
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.get('body').should('not.contain', '<script>');
    });

    it('should sanitize XSS attempts in fullname', () => {
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="fullname"]').type('<img src=x onerror=alert(1)>');
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.get('body').should('not.contain', '<img');
    });
  });

  describe('Successful Registration Flow', () => {
    it('should successfully register with valid inputs and show success toast', () => {
      const uniqueEmail = `cypress_${Date.now()}@test.com`;
      const uniqueUsername = `cypress_${Date.now()}`;
      
      cy.get('input[name="email"]').type(uniqueEmail);
      cy.get('input[name="fullname"]').type('Cypress Test User');
      cy.get('input[name="username"]').type(uniqueUsername);
      cy.get('input[name="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
      cy.get('#toast-container').find('.bg-green-800').should('exist');
      cy.get('#toast-container').should('contain.text', 'success');
      
      cy.contains('Registration Successful', { timeout: 10000 }).should('be.visible');
      cy.contains('check your email').should('be.visible');
      cy.get('a[href="/signin"]').should('be.visible');
    });

    it('should show loading state during registration', () => {
      const uniqueEmail = `cypress_${Date.now()}@test.com`;
      const uniqueUsername = `cypress_${Date.now()}`;
      
      cy.get('input[name="email"]').type(uniqueEmail);
      cy.get('input[name="fullname"]').type('Cypress Test User');
      cy.get('input[name="username"]').type(uniqueUsername);
      cy.get('input[name="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('.animate-spin').should('exist');
    });
  });

  describe('Duplicate User Handling', () => {
    it('should show toast error when registering with existing username', () => {
      const existingUsername = `existing_${Date.now()}`;
      
      cy.get('input[name="email"]').type(`first_${Date.now()}@test.com`);
      cy.get('input[name="fullname"]').type('First User');
      cy.get('input[name="username"]').type(existingUsername);
      cy.get('input[name="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Registration Successful', { timeout: 10000 }).should('be.visible');
      cy.visit(`${baseUrl}/signup`);
      cy.get('#register-form').should('be.visible');
      
      cy.get('input[name="email"]').type(`second_${Date.now()}@test.com`);
      cy.get('input[name="fullname"]').type('Second User');
      cy.get('input[name="username"]').type(existingUsername);
      cy.get('input[name="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
      cy.get('#toast-container').find('.bg-red-800').should('exist');
      cy.get('#toast-container').should('contain.text', 'already exists');
    });

    it('should show toast error when registering with existing email', () => {
      const existingEmail = `existing_${Date.now()}@test.com`;
      
      cy.get('input[name="email"]').type(existingEmail);
      cy.get('input[name="fullname"]').type('First User');
      cy.get('input[name="username"]').type(`first_${Date.now()}`);
      cy.get('input[name="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Registration Successful', { timeout: 10000 }).should('be.visible');
      cy.visit(`${baseUrl}/signup`);
      cy.get('#register-form').should('be.visible');
      
      cy.get('input[name="email"]').type(existingEmail);
      cy.get('input[name="fullname"]').type('Second User');
      cy.get('input[name="username"]').type(`second_${Date.now()}`);
      cy.get('input[name="password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
      cy.get('#toast-container').find('.bg-red-800').should('exist');
      cy.get('#toast-container').should('contain.text', 'already exists');
    });
  });

  describe('Toast Dismissal', () => {
    it('should allow closing toast by clicking X button', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: { error: 'Test error message', code: 'BAD_REQUEST' }
      }).as('registerRequest');

      cy.get('input[name="email"]').invoke('removeAttr', 'type').type('test');
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
      cy.get('#toast-container button').first().click();
      cy.get('#toast-container').should('not.exist');
    });

    it('should auto-dismiss toast after 3 seconds', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: { error: 'Test error message', code: 'BAD_REQUEST' }
      }).as('registerRequest');

      cy.get('input[name="email"]').invoke('removeAttr', 'type').type('test');
      cy.get('input[name="fullname"]').type(validUser.fullname);
      cy.get('input[name="username"]').type(validUser.username);
      cy.get('input[name="password"]').type(validUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      cy.get('#toast-container', { timeout: 10000 }).should('exist');
      cy.wait(4000);
      cy.get('#toast-container').should('not.exist');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page from register page', () => {
      cy.contains('Log in').click();
      cy.url().should('include', '/signin');
    });

    it('should have working logo image', () => {
      cy.get('img[alt="Camagru Logo"]').should('be.visible');
      cy.get('img[alt="Camagru Logo"]').should('have.attr', 'src').and('include', 'Camagru.svg');
    });
  });
});