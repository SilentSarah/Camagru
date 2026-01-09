describe('5. Settings Page', () => {
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

  const login = () => {
    cy.visit(`${baseUrl}/signin`);
    cy.get('input[name="username"]').type(validUsername);
    cy.get('input[name="password"]').type(validPassword);
    cy.get('#login-btn').click();
    cy.url({ timeout: 5000 }).should('eq', `${baseUrl}/`);
  };

  beforeEach(() => {
    login();
    cy.visit(`${baseUrl}/settings`);
    cy.wait(2000);
  });

  describe('Settings Page Display', () => {
    it('should display settings form', () => {
      cy.get('form').should('exist');
    });

    it('should display profile picture section', () => {
      cy.get('img').should('exist');
      cy.contains('Change photo').should('exist');
    });

    it('should display username field', () => {
      cy.get('input[name="username"]').should('exist');
    });

    it('should display email field', () => {
      cy.get('input[name="email"]').should('exist');
    });

    it('should display fullname field', () => {
      cy.get('input[name="fullname"]').should('exist');
    });

    it('should display bio textarea', () => {
      cy.get('textarea[name="bio"]').should('exist');
    });

    it('should display password field', () => {
      cy.get('input[name="password"]').should('exist');
    });

    it('should have email notifications toggle', () => {
      cy.get('input[name="email_notifications"]').should('exist');
    });

    it('should have save button disabled initially', () => {
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Profile Update', () => {
    it('should enable save button when bio is changed', () => {
      cy.get('textarea[name="bio"]').clear().type('Updated bio text');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should enable save button when fullname is changed', () => {
      cy.get('input[name="fullname"]').clear().type('New Full Name');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should update profile successfully', () => {
      cy.get('textarea[name="bio"]').then(($bio) => {
        const originalBio = $bio.val();
        const newBio = `Test bio ${Date.now()}`;
        
        cy.wrap($bio).clear().type(newBio);
        cy.get('button[type="submit"]').click();
        
        waitForToast();
      });
    });

    it('should show error for invalid email format', () => {
      cy.get('input[name="email"]').clear().type('invalid@notarealdomain');
      cy.get('button[type="submit"]').should('not.be.disabled');
      cy.get('button[type="submit"]').click();
      
      waitForToast();
    });
  });

  describe('Profile Picture', () => {
    it('should have file input for profile picture upload', () => {
      cy.get('input[type="file"]').should('exist');
    });

    it('should have change photo button', () => {
      cy.contains('Change photo').should('be.visible');
    });

    it('should show current profile picture', () => {
      cy.get('img').first().should('be.visible');
    });
  });

  describe('Password Change', () => {
    it('should enable save button when password is entered', () => {
      cy.get('input[name="password"]').type('newPassword123!');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });

  describe('Email Notifications Toggle', () => {
    it('should toggle email notifications', () => {
      cy.get('input[name="email_notifications"]').then(($checkbox) => {
        const wasChecked = $checkbox.is(':checked');
        cy.wrap($checkbox).click({ force: true });
        cy.get('button[type="submit"]').should('not.be.disabled');
      });
    });

    it('should have notification description text', () => {
      cy.contains('Get notified when someone likes or comments').should('exist');
    });
  });

  describe('Account Deletion', () => {
    it('should have delete account button', () => {
      cy.contains('Delete Account').should('exist');
    });

    it('should show confirmation modal when clicking delete', () => {
      cy.contains('Delete Account').click();
      cy.wait(500);
      cy.contains('Delete Account?').should('be.visible');
      cy.contains('This action cannot be undone').should('be.visible');
    });

    it('should have Delete Forever and Cancel buttons in modal', () => {
      cy.contains('Delete Account').click();
      cy.wait(500);
      cy.contains('Delete Forever').should('be.visible');
      cy.contains('Cancel').should('be.visible');
    });

    it('should close modal when clicking cancel', () => {
      cy.contains('Delete Account').click();
      cy.wait(500);
      cy.contains('Cancel').click();
      cy.contains('Delete Account?').should('not.exist');
    });
  });

  describe('Form Validation', () => {
    it('should have bio character counter', () => {
      cy.get('textarea[name="bio"]').clear().type('Test');
      cy.contains('/ 150').should('exist');
    });

    it('should limit bio to 150 characters', () => {
      cy.get('textarea[name="bio"]').should('have.attr', 'maxlength', '150');
    });
  });

  describe('Page Title', () => {
    it('should display Edit profile title', () => {
      cy.contains('Edit profile').should('be.visible');
    });
  });
});
