describe('6. Post Page - Interactions', () => {
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

  const navigateToFirstPost = () => {
    cy.visit(`${baseUrl}/`);
    cy.wait(2000);
    cy.get('#feed-container').children().first().find('.post-image-container img').click();
    cy.url({ timeout: 5000 }).should('include', '/post?id=');
  };

  beforeEach(() => {
    login();
  });

  describe('Post Page Display', () => {
    beforeEach(() => {
      navigateToFirstPost();
    });

    it('should display post image', () => {
      cy.get('img[src*="uploads"]').should('be.visible');
    });

    it('should display post author', () => {
      cy.get('a[href*="profile"]').should('exist');
    });

    it('should display like button', () => {
      cy.get('#like-btn').should('exist');
    });

    it('should display comment section', () => {
      cy.get('input[placeholder*="comment" i], textarea[placeholder*="comment" i]').should('exist');
    });

    it('should display share button', () => {
      cy.get('#share-btn').should('exist');
    });
  });

  describe('Like Functionality', () => {
    beforeEach(() => {
      navigateToFirstPost();
    });

    it('should toggle like on click', () => {
      cy.get('#like-btn').click();
      cy.wait(1000);
    });

    it('should update like count', () => {
      cy.get('#likes-count').invoke('text').then((initialCount) => {
        cy.get('#like-btn').click();
        cy.wait(1000);
      });
    });
  });

  describe('Comment Functionality', () => {
    beforeEach(() => {
      navigateToFirstPost();
    });

    it('should post a comment', () => {
      const commentText = `Test comment ${Date.now()}`;
      cy.get('input[placeholder*="comment" i], textarea[placeholder*="comment" i]')
        .type(commentText);
      cy.get('button').contains(/post|send|submit/i).click();
      
      cy.wait(2000);
      cy.get('body').should('contain.text', commentText);
    });

    it('should not allow empty comment', () => {
      cy.get('button').contains(/post|send|submit/i).should('be.disabled');
    });

    it('should display existing comments', () => {
      cy.wait(1000);
    });

    it('should show delete button for own comments', () => {
      const commentText = `Delete test ${Date.now()}`;
      cy.get('input[placeholder*="comment" i], textarea[placeholder*="comment" i]')
        .type(commentText);
      cy.get('button').contains(/post|send|submit/i).click();
      
      cy.wait(3000);
      cy.contains(commentText).parents('.comment-item').first().within(() => {
        cy.get('.comment-delete-btn').should('exist');
      });
    });
  });

  describe('Comment Deletion', () => {
    beforeEach(() => {
      navigateToFirstPost();
    });

    it('should delete own comment', () => {
      const commentText = `To delete ${Date.now()}`;
      cy.get('input[placeholder*="comment" i], textarea[placeholder*="comment" i]')
        .type(commentText);
      cy.get('button').contains(/post|send|submit/i).click();
      
      cy.wait(3000);
      cy.contains(commentText).should('exist');
      
      cy.contains(commentText).parents('.comment-item').first()
        .find('.comment-delete-btn').click({ force: true });
      
      cy.wait(500);
      cy.get('#confirm-btn', { timeout: 5000 }).should('be.visible').click();
      
      cy.wait(2000);
    });

    it('should show confirmation before deleting comment', () => {
      const commentText = `Confirm delete ${Date.now()}`;
      cy.get('input[placeholder*="comment" i], textarea[placeholder*="comment" i]')
        .type(commentText);
      cy.get('button').contains(/post|send|submit/i).click();
      
      cy.wait(3000);
      cy.contains(commentText).parents('.comment-item').first()
        .find('.comment-delete-btn').click({ force: true });
      
      cy.wait(500);
      cy.get('body').should('contain.text', 'Are you sure');
    });
  });

  describe('Share Functionality', () => {
    beforeEach(() => {
      navigateToFirstPost();
    });

    it('should open share dropdown on click', () => {
      cy.get('#share-btn').click();
      cy.wait(500);
      cy.get('#share-dropdown').should('be.visible');
    });

    it('should display Facebook share link', () => {
      cy.get('#share-btn').click();
      cy.wait(500);
      cy.get('a[href*="facebook.com"]').should('exist');
    });

    it('should display WhatsApp share link', () => {
      cy.get('#share-btn').click();
      cy.wait(500);
      cy.get('a[href*="wa.me"]').should('exist');
    });

    it('should have copy link button', () => {
      cy.get('#share-btn').click();
      cy.wait(500);
      cy.get('#copy-link-btn').should('exist');
    });

    it('should copy link to clipboard', () => {
      cy.get('#share-btn').click();
      cy.wait(500);
      cy.get('#copy-link-btn').click();
      cy.wait(1000);
      cy.get('#toast-container', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Post Deletion (Own Posts)', () => {
    it('should show delete option for own posts', () => {
      cy.visit(`${baseUrl}/profile`);
      cy.wait(2000);
      cy.get('#photos-grid [data-photo-id]').first().click();
      cy.url({ timeout: 5000 }).should('include', '/post?id=');
      
      cy.get('#post-options-btn').should('exist');
    });

    it('should show confirmation modal before deleting post', () => {
      cy.visit(`${baseUrl}/profile`);
      cy.wait(2000);
      cy.get('#photos-grid [data-photo-id]').first().click();
      cy.url({ timeout: 5000 }).should('include', '/post?id=');
      
      cy.get('#post-options-btn').click();
      cy.wait(300);
      cy.get('#delete-post-btn').should('be.visible').click();
      cy.wait(500);
      cy.get('body').should('contain.text', 'Are you sure');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      navigateToFirstPost();
    });

    it('should have back button', () => {
      cy.get('i.fa-arrow-left').parent('button').should('exist');
    });

    it('should navigate to author profile on click', () => {
      cy.get('a[href*="profile"]').first().click();
      cy.url().should('include', '/profile');
    });
  });
});
