describe('7. Editor Page', () => {
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
    cy.visit(`${baseUrl}/editor`);
    cy.wait(2000);
  });

  describe('Editor Page Display', () => {
    it('should display Photo Editor header', () => {
      cy.contains('Photo Editor').should('be.visible');
    });

    it('should have Camera and Upload mode buttons', () => {
      cy.get('#btn-camera-mode').should('exist');
      cy.get('#btn-upload-mode').should('exist');
    });

    it('should have upload input hidden', () => {
      cy.get('#upload-input').should('exist').and('not.be.visible');
    });

    it('should display canvas wrapper area', () => {
      cy.get('#canvas-wrapper').should('exist');
    });

    it('should have Next button disabled initially', () => {
      cy.get('#btn-next').should('be.disabled');
    });
  });

  describe('Tabs and Panels', () => {
    it('should have Filters tab active by default', () => {
      cy.get('#tab-filters').should('have.class', 'border-white');
    });

    it('should display Stickers tab', () => {
      cy.get('#tab-stickers').should('exist');
    });

    it('should switch to Stickers panel when clicking tab', () => {
      cy.get('#tab-stickers').click();
      cy.get('#panel-stickers').should('not.have.class', 'hidden');
      cy.get('#panel-filters').should('have.class', 'hidden');
    });

    it('should switch back to Filters panel', () => {
      cy.get('#tab-stickers').click();
      cy.get('#tab-filters').click();
      cy.get('#panel-filters').should('not.have.class', 'hidden');
    });
  });

  describe('Filters', () => {
    it('should display all filter options', () => {
      cy.get('.filter-btn').should('have.length', 8);
    });

    it('should display filter names', () => {
      cy.contains('Normal').should('exist');
      cy.contains('B&W').should('exist');
      cy.contains('Sepia').should('exist');
      cy.contains('Vivid').should('exist');
      cy.contains('Bright').should('exist');
      cy.contains('Vintage').should('exist');
      cy.contains('Cool').should('exist');
      cy.contains('Warm').should('exist');
    });

    it('should have Normal filter selected by default', () => {
      cy.get('.filter-btn[data-filter-id="normal"] .filter-preview')
        .should('have.class', 'border-blue-500');
    });

    it('should select a different filter when clicked', () => {
      cy.get('.filter-btn[data-filter-id="grayscale"]').click();
      cy.get('.filter-btn[data-filter-id="grayscale"] .filter-preview')
        .should('have.class', 'border-blue-500');
    });

    it('should enable Next button when filter is applied', () => {
      cy.get('.filter-btn[data-filter-id="sepia"]').click();
      cy.get('#btn-next').should('not.be.disabled');
    });
  });

  describe('Image Upload', () => {
    it('should trigger file dialog when Upload button is clicked', () => {
      cy.get('#btn-upload-mode').click();
    });

    it('should have file input accepting images', () => {
      cy.get('#upload-input').should('have.attr', 'accept', 'image/*');
    });

    it('should upload an image and show canvas', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#canvas-container').should('not.have.class', 'hidden');
      cy.get('#editor-canvas').should('exist');
    });

    it('should enable Next button after image upload', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#btn-next').should('not.be.disabled');
    });

    it('should apply filter to uploaded image', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('.filter-btn[data-filter-id="grayscale"]').click();
      cy.get('.filter-btn[data-filter-id="grayscale"] .filter-preview')
        .should('have.class', 'border-blue-500');
    });
  });

  describe('Stickers', () => {
    it('should display sticker upload button', () => {
      cy.get('#tab-stickers').click();
      cy.get('.sticker-upload-btn').should('exist');
    });

    it('should have sticker file input', () => {
      cy.get('#sticker-input').should('exist');
    });

    it('should accept PNG, JPEG, GIF for stickers', () => {
      cy.get('#sticker-input').should('have.attr', 'accept', 'image/png,image/jpeg,image/gif');
    });
  });

  describe('Share/Post Flow', () => {
    beforeEach(() => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      cy.wait(2000);
    });

    it('should open share view when clicking Next', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#share-view').should('be.visible');
    });

    it('should display Create Post header in share view', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.contains('Create Post').should('be.visible');
    });

    it('should display image preview in share view', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#share-preview-image').should('be.visible');
    });

    it('should have caption input', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#caption-input').should('exist');
    });

    it('should have character counter for caption', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#caption-count').should('contain.text', '0');
    });

    it('should update character count when typing caption', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#caption-input').type('Test caption');
      cy.get('#caption-count').should('contain.text', '12');
    });

    it('should have Post button', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-post').should('exist').and('contain.text', 'Post');
    });

    it('should have Back button', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-back-editor').should('exist');
    });

    it('should return to editor when clicking Back', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-back-editor').click();
      cy.wait(500);
      cy.get('#share-view').should('have.class', 'hidden');
    });
  });

  describe('Post Creation (Backend Integration)', () => {
    beforeEach(() => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      cy.wait(2000);
    });

    it('should post image successfully', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      
      cy.get('#caption-input').type('Cypress test post');
      cy.get('#btn-post').click();
      
      cy.wait(1000);
      waitForToast();
    });

    it('should change Post button text while posting', () => {
      cy.get('#btn-next').click();
      cy.wait(1000);
      
      cy.get('#btn-post').click();
      cy.get('#btn-post').should('contain.text', 'Posting');
    });
  });

  describe('Drafts', () => {
    it('should display drafts section on desktop', () => {
      cy.viewport(1280, 720);
      cy.reload();
      cy.wait(2000);
      cy.get('#drafts-container').should('exist');
    });

    it('should have mobile drafts tab', () => {
      cy.viewport(375, 667);
      cy.reload();
      cy.wait(2000);
      cy.get('#tab-drafts-mobile').should('exist');
    });

    it('should show empty state when no drafts exist', () => {
      cy.window().then((win) => {
        win.localStorage.removeItem('camagru_drafts');
      });
      cy.reload();
      cy.wait(2000);
      cy.viewport(1280, 720);
      cy.get('#drafts-container').should('contain.text', 'No drafts yet');
    });

    it('should save draft when clicking Back from share view', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#btn-next').click();
      cy.wait(1000);
      
      cy.get('#btn-back-editor').click();
      cy.wait(1000);
      
      waitForToast('Saved to recents');
    });

    it('should display saved draft in drafts container', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-back-editor').click();
      cy.wait(1000);
      
      cy.viewport(1280, 720);
      cy.reload();
      cy.wait(2000);
      
      cy.get('#drafts-container .draft-item').should('have.length.at.least', 1);
    });

    it('should load draft into canvas when clicked', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-back-editor').click();
      cy.wait(1000);
      
      cy.viewport(1280, 720);
      cy.reload();
      cy.wait(2000);
      
      cy.get('#drafts-container .draft-item').first().click();
      cy.wait(1000);
      
      cy.get('#canvas-container').should('not.have.class', 'hidden');
      cy.get('#editor-canvas').should('exist');
      cy.get('#btn-next').should('not.be.disabled');
    });

    it('should display draft thumbnail correctly', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-back-editor').click();
      cy.wait(1000);
      
      cy.viewport(1280, 720);
      cy.reload();
      cy.wait(2000);
      
      cy.get('#drafts-container .draft-item img').first()
        .should('have.attr', 'src')
        .and('include', 'data:image');
    });

    it('should show mobile drafts panel when tab is clicked', () => {
      cy.viewport(375, 667);
      cy.reload();
      cy.wait(2000);
      
      cy.get('#tab-drafts-mobile').click();
      cy.get('#panel-drafts-mobile').should('not.have.class', 'hidden');
    });

    it('should load draft from mobile panel when clicked', () => {
      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('#upload-input').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait(2000);
      cy.get('#btn-next').click();
      cy.wait(1000);
      cy.get('#btn-back-editor').click();
      cy.wait(1000);
      
      cy.viewport(375, 667);
      cy.reload();
      cy.wait(2000);
      
      cy.get('#tab-drafts-mobile').click();
      cy.wait(500);
      
      cy.get('#drafts-container-mobile .draft-item').first().click();
      cy.wait(1000);
      
      cy.get('#canvas-container').should('not.have.class', 'hidden');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.reload();
      cy.wait(2000);
      cy.get('#canvas-wrapper').should('be.visible');
      cy.get('#tab-filters').should('be.visible');
    });

    it('should display correctly on desktop', () => {
      cy.viewport(1280, 720);
      cy.reload();
      cy.wait(2000);
      cy.get('#canvas-wrapper').should('be.visible');
      cy.get('.drafts-section').should('be.visible');
    });
  });
});
