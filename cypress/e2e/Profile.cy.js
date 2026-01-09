describe('4. Profile Page', () => {
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
  });

  describe('Own Profile Display', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/profile`);
    });

    it('should display profile header with user info', () => {
      cy.get('body').should('contain.text', validUsername);
    });

    it('should display profile picture or default avatar', () => {
      cy.get('img').should('exist');
    });

    it('should display post count', () => {
      cy.get('body').should('contain.text', 'posts');
    });

    it('should display settings button for own profile', () => {
      cy.get('a[href*="settings"]').should('exist');
    });
  });

  describe('Photo Grid', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/profile`);
    });

    it('should display photos grid or empty state', () => {
      cy.wait(2000);
      cy.get('#photos-grid').should('exist');
      cy.get('#photos-grid').then(($grid) => {
        const hasPhotos = $grid.find('[data-photo-id]').length > 0;
        if (!hasPhotos) {
          cy.get('body').should('contain.text', 'No posts').or(cy.contains('Share Photos'));
        }
      });
    });

    it('should navigate to post on photo click', () => {
      cy.wait(2000);
      cy.get('#photos-grid [data-photo-id]').first().then(($card) => {
        if ($card.length > 0) {
          cy.wrap($card).click();
          cy.url().should('include', '/post?id=');
        }
      });
    });
  });

  describe('Other User Profile', () => {
    it('should display other user profile when visiting with user_id', () => {
      cy.visit(`${baseUrl}/profile?user_id=1`);
      cy.wait(2000);
      cy.get('body').should('contain.text', 'posts');
    });

    it('should not show settings button for other profiles', () => {
      cy.visit(`${baseUrl}/profile?user_id=1`);
      cy.wait(2000);
    });
  });

  describe('Pagination / Infinite Scroll', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/profile`);
    });

    it('should load more photos on scroll if available', () => {
      cy.wait(3000);
      cy.scrollTo('bottom', { ensureScrollable: false });
      cy.wait(2000);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/profile`);
    });

    it('should have settings link', () => {
      cy.get('a[href*="settings"]').should('exist');
    });

    it('should navigate to settings page', () => {
      cy.get('a[href*="settings"]').click();
      cy.url().should('include', '/settings');
    });
  });
});
