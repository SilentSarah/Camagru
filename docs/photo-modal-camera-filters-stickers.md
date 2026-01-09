# Editor Page & Photo Processing - Technical Documentation

A comprehensive guide to the photo editor system covering architecture, camera access, filters, stickers, image composition, and backend processing.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Camera Access & Modes](#camera-access--modes)
5. [Filter System](#filter-system)
6. [Sticker System](#sticker-system)
7. [Image Composition Strategy](#image-composition-strategy)
8. [Backend Processing](#backend-processing)
9. [Drafts System](#drafts-system)

---

## Architecture Overview

The photo editing experience is centered around the **Editor Page** (`src/frontend/pages/EditorPage.js`). It creates a unified environment for:

- Capturing photos via webcam.
- Uploading existing images.
- Applying CSS-based filters (preview) and Imagick-based filters (final).
- Placing custom stickers.
- Managing local drafts.

The system uses a **Hybrid Composition Strategy**:

- **Frontend** provides real-time previews using CSS filters, HTML DOM overlays (for stickers), and Canvas (for baking previews).
- **Backend** performs the final high-quality rendering using PHP's `Imagick` extension to ensure security and consistency.

### File Structure

```
src/frontend/
├── pages/
│   └── EditorPage.js           # Main orchestrator (Page Entry)
├── utils/
│   ├── PhotoCompositor.js      # Canvas helper for baking/rendering
│   └── DraftStorage.js         # LocalStorage management for drafts
└── components/
    └── Modal/photo-creation/   # (Legacy/Shared components if any)

src/backend/
├── Controllers/
│   └── MediaController.php     # Handles /process-image, /upload-post
└── Core/
    └── Utils.php               # ImageHelpers class (Imagick logic)
```

---

## Component Structure

### EditorPage.js

This is the main controller that:

1.  **Injects Styles**: Dynamically adds CSS for the editor layout and sticker overlays.
2.  **Renders DOM**: Creates the responsive layout (canvas area, panels for filters/stickers, drafts strip).
3.  **Manages State**: Tracks current mode (camera/image), active filter, sticker list, and media stream.
4.  **Handles Events**: Click, drag, resize, and touch events for stickers and interaction.

### PhotoCompositor.js

A utility class wrapping the HTML5 Canvas API.

- **Responsibilities**:
  - Loading images/video frames onto a canvas.
  - Resizing images to manageable dimensions.
  - Baking stickers and filters into a single data URL for "Next" step previews.
  - Exporting `Blob` or `DataURL` for upload.

---

## State Management

State is encapsulated within `attachEventListeners` in `EditorPage.js`.

- **`currentMode`**: `'camera'` or `'image'`. Determines whether to show the `<video>` feed or `<canvas>`/`<img>` container.
- **`currentFilter`**: CSS string (e.g., `sepia(80%)`). Applied style-side to preview elements, and passed as string to backend.
- **`appliedStickers`**: Array of objects:
  ```javascript
  {
    id: number,
    type: 'image',
    imageUrl: string (base64 or URL),
    x: number, // 0-1 relative to canvas
    y: number, // 0-1 relative to canvas
    scale: number,
    element: HTMLElement // Reference to DOM overlay
  }
  ```
- **`mediaStream`**: The active webcam stream.
- **`pendingRawImageUrl`**: The original captured/uploaded image _without_ effects. Sent to backend for processing.
- **`pendingImageUrl`**: The frontend-baked image _with_ effects. Used for the "Share" preview screen.

---

## Camera Access & Modes

### Camera Mode

1.  **Initialization**: `navigator.mediaDevices.getUserMedia` requests video (ideal 720p).
2.  **Preview**: displayed in `<video id="camera-video">`.
3.  **Mirroring**: CSS `transform: scaleX(-1)` is applied (via classes or inline styles usually, though check implementation details) to mimic a mirror.
4.  **Capture**:
    - When "Next" is clicked, the current video frame is drawn to a temporary canvas.
    - Filters and sticker DOM positions are read and "baked" onto this canvas for the frontend preview.
    - The _raw_ frame is also saved for backend processing.

### Image Mode (Upload)

1.  **Input**: User selects file via `<input type="file">`.
2.  **Loading**: `PhotoCompositor.loadImage` loads it onto `<canvas id="editor-canvas">`.
3.  **Preview**: CSS filters are applied to the canvas container. Stickers are overlaid as DOM elements.

---

## Filter System

### Frontend (Preview)

Filters are visual presets defined in `EditorPage.js`.

- **Mechanism**: Standard CSS `filter` property.
- **Application**: Applied to both the background (video/canvas) and the sticker layer container, ensuring the entire composition looks consistent.

**Presets**:

- `Normal`: `none`
- `B&W`: `grayscale(100%)`
- `Sepia`: `sepia(80%)`
- `Vintage`: `sepia(40%) contrast(90%) brightness(90%)`
- (and others)

### Backend (Processing)

The backend `ImageHelpers::process_filters` manually recreates these effects using `Imagick`:

- Parses the CSS string (regex).
- Maps `sepia()`, `brightness()`, `grayscale()`, `hue-rotate()` to equivalent color matrices or Imagick functions.

---

## Sticker System

### Interaction

Stickers are strictly **Custom Image Uploads** (PNG/JPG/GIF).

- **DOM Overlay**: Stickers are `<div>` elements absolutely positioned over the canvas area.
- **Coordinates**: Stored as percentage (0.0 to 1.0) of the container width/height. This ensures responsiveness if the preview resizes.

### Gestures

Implemented in `setupStickerInteractions` (EditorPage.js):

- **Drag**: Updates `left`/`top` CSS and `x`/`y` state.
- **Resize**: Handle at bottom-right corner updates `scale` state and CSS `transform: scale()`.
- **Delete**: Button at top-right removes element and state entry.

### Resolution Handling

Since the preview area (e.g. 400x400) differs from the actual image (e.g. 1280x720), scaling logic is critical.

- **Frontend**: Stickers are displayed relative to the _visual_ container.
- **Backend**: `x`/`y` are multiplied by the _actual_ image dimensions. `scale` is adjusted based on the ratio between visual width and actual image width.

---

## Image Composition Strategy

### The "Process" Flow

When the user clicks **Post**:

1.  **Check for Edits**:

    - If no filters/stickers: `finalImageUrl` = `pendingImageUrl` (frontend capture).
    - If edits exist: Frontend prepares a payload for `/process-image`.

2.  **Process Request (`/process-image`)**:

    - **Detailed Payload**:
      - `image`: Base64 of the _raw_ image (no effects).
      - `filter`: CSS filter string.
      - `stickers`: JSON array of sticker data.
      - `canvasWidth`/`canvasHeight`: (Optional context).

3.  **Backend Execution (`Utils.php`)**:

    - **Decodes** the raw image.
    - **Compounding**:
      - Loops through `stickers`.
      - Resizes sticker image based on `scale` \* `baseWidth` (approx 128px relative reference).
      - Composites onto main image at calculated X/Y.
    - **Filtering**:
      - Applies color matrix transformations (Sepia, Brightness, etc.) to the _entire_ composited image (background + stickers).
    - **Response**: Returns URL of the processed temporary image.

4.  **Upload (`/upload-post`)**:
    - Frontend takes the result (from process-image or raw), converts to `Blob`.
    - Uploads to final endpoint with description.

---

## Drafts System

Managed by `DraftStorage.js` using `localStorage`.

- **Capacity**: Limited (e.g., 5 drafts) to prevent quota errors.
- **Conflict Resolution**: If storage is full, it attempts to remove old drafts or halve the list.
- **Content**: Stores the _baked_ small thumbnail and the medium-res image.
  - _Note_: Drafts currently store the "baked" state (filters/stickers applied permanently to the stored image) to simplify restoration, though raw-edit restoration could be a future enhancement.

---

## Validation & Error Handling

- **File Types**: Frontend restricts to images. Backend verifies MIME types (`finfo`).
- **Size Limits**: Configured in `Config.php` (e.g., 10MB). Checked on both frontend (pre-upload) and backend.
- **Rate Limiting**: Backend `process_image` and `upload_post` are rate-limited per IP (`RATE_LIMIT_WRITE`).
