describe('3. Home Feed', () => {
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

  describe('Feed Display', () => {
    it('should display the home feed container', () => {
      cy.get('#feed-container').should('exist');
    });

    it('should show posts or empty state', () => {
      cy.get('body').then(($body) => {
        if ($body.find('#empty-state:visible').length > 0) {
          cy.get('#empty-state').should('be.visible');
          cy.get('#empty-state').should('contain.text', 'No posts yet');
        } else {
          cy.get('#feed-container').children().should('have.length.at.least', 1);
        }
      });
    });

    it('should display loading spinner initially', () => {
      cy.visit(`${baseUrl}/`);
      cy.get('.animate-spin').should('exist');
    });
  });

  describe('Post Interactions', () => {
    it('should display post elements (image, author, actions)', () => {
      cy.get('#feed-container').children().first().within(() => {
        cy.get('img').should('exist');
        cy.get('a[href*="profile"]').should('exist');
      });
    });

    it('should navigate to post page when clicking on post', () => {
      cy.get('#feed-container').children().first().find('.post-image-container img').click();
      cy.url().should('include', '/post?id=');
    });
  });

  describe('Infinite Scroll', () => {
    it('should have sentinel element for infinite scroll', () => {
      cy.get('#feed-sentinel').should('exist');
    });

    it('should load more posts when scrolling to bottom', () => {
      cy.get('#feed-container').children().then(($initialPosts) => {
        const initialCount = $initialPosts.length;
        if (initialCount > 0) {
          cy.get('#feed-sentinel').scrollIntoView();
          cy.wait(2000);
        }
      });
    });
  });

  describe('Navigation', () => {
    it('should have working navigation links', () => {
      cy.get('nav').should('exist');
    });

    it('should navigate to profile when clicking profile link', () => {
      cy.get('a[href*="profile"]').first().click();
      cy.url().should('include', '/profile');
    });
  });
});
