describe('2. Login', () => {
  const baseUrl = Cypress.env('baseUrl');
  const validUsername = Cypress.env('validUsername');
  const validPassword = Cypress.env('validPassword');

  const waitForToast = (expectedText = null) => {
    cy.wait(500);
    cy.get('#toast-container', { timeout: 10000 }).should('be.visible');
    if (expectedText) {
      cy.get('#toast-container').should('contain.text', expectedText);
    }
  };

  beforeEach(() => {
    cy.visit(`${baseUrl}/signin`);
    cy.get('#login-form').should('be.visible');
  });

  describe('Form Validation - Required Fields', () => {
    it('should show error when submitting empty form', () => {
      cy.get('#login-btn').click();
      cy.get('input[name="username"]:invalid').should('exist');
    });

    it('should show error when username is missing', () => {
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();
      cy.get('input[name="username"]:invalid').should('exist');
    });

    it('should show error when password is missing', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('#login-btn').click();
      cy.get('input[name="password"]:invalid').should('exist');
    });
  });

  describe('Backend Validation - Toast Error Messages', () => {
    it('should show toast error for invalid credentials', () => {
      cy.get('input[name="username"]').type('nonexistentuser');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('#login-btn').click();

      waitForToast();
    });

    it('should show "User not found" toast for non-existent user', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 404,
        body: { error: 'User not found', code: 'USER_NOT_FOUND' }
      }).as('loginRequest');

      cy.get('input[name="username"]').type('nonexistentuser');
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();

      cy.wait('@loginRequest');
      waitForToast('User not found');
    });

    it('should show "Invalid credentials" toast for wrong password', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }
      }).as('loginRequest');

      cy.get('input[name="username"]').type('existinguser');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('#login-btn').click();

      cy.wait('@loginRequest');
      waitForToast('Invalid credentials');
    });

    it('should redirect to verify page for unverified user', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { error: 'User not verified', code: 'USER_NOT_VERIFIED' }
      }).as('loginRequest');

      cy.get('input[name="username"]').type('unverifieduser');
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/verify');
    });
  });

  describe('Form Validation - Input Handling', () => {
    it('should handle whitespace-only username', () => {
      cy.get('input[name="username"]').type('   ');
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();
      
      waitForToast();
    });

    it('should handle XSS attempts in username', () => {
      cy.get('input[name="username"]').type('<script>alert(1)</script>');
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();
      
      cy.get('body').should('not.contain', '<script>');
    });

    it('should handle special characters in username', () => {
      cy.get('input[name="username"]').type("user'name");
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();
      
      waitForToast();
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(200);
      cy.get('input[name="username"]').type(longUsername);
      cy.get('input[name="password"]').type('password123');
      cy.get('#login-btn').click();
      
      waitForToast();
    });
  });

  describe('Successful Login Flow', () => {
    it('should successfully login with valid credentials', () => {
      cy.get('input[name="username"]').type(validUsername);
      cy.get('input[name="password"]').type(validPassword);
      cy.get('#login-btn').click();

      waitForToast('success');
      cy.url({ timeout: 5000 }).should('eq', `${baseUrl}/`);
    });

    it('should disable submit button during login', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { message: 'Login successful', token: 'fake-jwt-token' },
        delay: 1000
      }).as('loginRequest');

      cy.get('input[name="username"]').type(validUsername);
      cy.get('input[name="password"]').type(validPassword);
      cy.get('#login-btn').click();

      cy.get('#login-btn').should('be.disabled');
    });

    it('should re-enable submit button after failed login', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }
      }).as('loginRequest');

      cy.get('input[name="username"]').type('invaliduser');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('#login-btn').click();

      cy.wait('@loginRequest');
      waitForToast();
      cy.get('#login-btn').should('not.be.disabled');
    });
  });

  describe('Navigation', () => {
    it('should navigate to signup page', () => {
      cy.contains('Sign up').click();
      cy.url().should('include', '/signup');
    });

    it('should navigate to password recovery page', () => {
      cy.contains('Forgot password?').click();
      cy.url().should('include', '/password-recovery');
    });

    it('should have working logo image', () => {
      cy.get('img[alt="Camagru Logo"]').should('be.visible');
      cy.get('img[alt="Camagru Logo"]').should('have.attr', 'src').and('include', 'Camagru.svg');
    });
  });

  describe('UI Elements', () => {
    it('should display all form elements', () => {
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('#login-btn').should('be.visible').and('contain.text', 'Login');
      cy.contains('Forgot password?').should('be.visible');
      cy.contains("Don't have an account?").should('be.visible');
    });

    it('should have password field masked', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('should display login image on large screens', () => {
      cy.viewport(1280, 720);
      cy.get('img[alt="login-image"]').should('be.visible');
    });

    it('should hide login image on mobile', () => {
      cy.viewport(375, 667);
      cy.get('img[alt="login-image"]').should('not.be.visible');
    });
  });
});
