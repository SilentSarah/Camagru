# Photo Modal - Complete Technical Documentation

A comprehensive guide to the photo modal system covering architecture, camera access, filters, stickers, image composition, and validation.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Camera Access Implementation](#camera-access-implementation)
5. [Preview Display System](#preview-display-system)
6. [Filter System](#filter-system)
7. [Sticker System](#sticker-system)
8. [Custom Stickers](#custom-stickers)
9. [Image Composition & Capture](#image-composition--capture)
10. [Validation & Error Handling](#validation--error-handling)
11. [Data Flow](#data-flow)

---

## Architecture Overview

The photo modal is a self-contained component system that manages the entire photo capture and editing workflow. It follows a single-modal, multi-view architecture where one modal contains multiple views that the user navigates through.

### File Structure

```
src/frontend/components/photo-modal/
├── PhotoModal.js          # Main orchestrator (entry point)
├── PhotoModalStyles.js    # Component-scoped CSS
├── CameraView.js          # Camera preview UI
├── UploadView.js          # File upload UI
├── PhotoPreview.js        # Image preview + PhotoCompositor class
├── ConfirmationView.js    # Final review before upload
├── FilterList.js          # Filter selection component
└── StickerList.js         # Sticker selection component
```

### View Flow

```
┌─────────────────┐
│  Selection View │  ← Entry point: Choose camera or upload
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Camera │ │ Upload │
│  View  │ │  View  │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│ Confirmation    │  ← Review and add description
│     View        │
└────────┬────────┘
         ▼
      Upload to server
```

---

## Component Structure

### PhotoModal.js - The Orchestrator

This is the main component that manages all state and coordinates between views.

```javascript
// File: src/frontend/components/photo-modal/PhotoModal.js

import CameraView from "./CameraView.js";
import UploadView from "./UploadView.js";
import ConfirmationView from "./ConfirmationView.js";
import { PhotoCompositor } from "./PhotoPreview.js";
import FilterList, { FILTERS, connectFiltersToStream } from "./FilterList.js";
import StickerList, { STICKERS } from "./StickerList.js";
import PhotoModalStyles from "./PhotoModalStyles.js";
import showToast from "../../utils/Toast.js";

/**
 * PhotoModal Component
 * @param {Object} props
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSave - Callback when photo is saved with (dataUrl, description)
 */
export default function PhotoModal({ onClose, onSave }) {
  // State variables are declared here - see State Management section
  // View switching, handlers, and composition logic are implemented here
}
```

### How the Modal is Created

The modal is rendered by creating a DOM element and appending it to the document body:

```javascript
// Inside PhotoModal function

// Create modal overlay element
const overlay = document.createElement("div");
overlay.className =
  "photo-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80";
overlay.id = "photo-modal-overlay";

// Inject component styles
const styleElement = document.createElement("style");
styleElement.textContent = PhotoModalStyles();
overlay.appendChild(styleElement);

// Create content container
const content = document.createElement("div");
content.className = "photo-modal-content ...";
content.id = "modal-content";
overlay.appendChild(content);

// Add to DOM
document.body.appendChild(overlay);
```

---

## State Management

All state is managed within the PhotoModal function using closures. This provides encapsulation and prevents state leakage.

### Core State Variables

```javascript
// File: src/frontend/components/photo-modal/PhotoModal.js (lines ~35-60)

// --- VIEW STATE ---
let currentView = "selection"; // 'selection' | 'upload' | 'camera' | 'confirmation'
let previousView = null; // For back navigation

// --- CAMERA STATE ---
let mediaStream = null; // MediaStream from getUserMedia
let isCaptured = false; // Whether photo has been taken

// --- COMPOSITION STATE ---
let compositor = null; // PhotoCompositor instance for image manipulation
let currentFilter = "none"; // Current CSS filter string (e.g., 'grayscale(100%)')
let placedStickers = []; // Array of placed sticker objects

// --- OUTPUT STATE ---
let finalImageDataUrl = null; // The final composed image as data URL

// --- PERSISTENT STATE (module-level, outside function) ---
let recentShots = []; // Persists across modal opens within session
```

### Sticker Data Structure

Each placed sticker is tracked with this structure:

```javascript
// For custom image stickers (only type supported now):
{
    id: 1702569601000,
    type: 'image',               // Identifies as custom image
    imageUrl: 'data:image/png;base64,...',  // Base64 data URL
    element: HTMLDivElement,
    scale: 1.0,
    x: 0.5,                      // Relative position (0-1)
    y: 0.5                       // Relative position (0-1)
}
```

### Filter Data Structure

Filters are defined in `EditorView.js`:

```javascript
const FILTERS = [
  { id: "normal", name: "Normal", css: "none" },
  { id: "grayscale", name: "B&W", css: "grayscale(100%)" },
  { id: "sepia", name: "Sepia", css: "sepia(80%)" },
  { id: "contrast", name: "Vivid", css: "contrast(130%) saturate(120%)" },
  { id: "brightness", name: "Bright", css: "brightness(120%)" },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(40%) contrast(90%) brightness(90%)",
  },
  { id: "cool", name: "Cool", css: "saturate(80%) hue-rotate(20deg)" },
  { id: "warm", name: "Warm", css: "saturate(110%) sepia(20%)" },
];
```

---

## Backend Image Processing

The backend handles image composition to ensure high-quality output and support for animated GIFs.

### ImageHelpers Class (`src/backend/Core/Utils.php`)

All image processing logic is encapsulated in the static `ImageHelpers` class.

1.  **`process_image`**: The main entry point. Receives the base64 image, sticker data, and filter string.
2.  **`process_stickers`**:
    - Decodes base64 sticker images.
    - Scales stickers relative to the main image width, matching the frontend's visual proportion.
    - Composites stickers onto the main image using `Imagick::compositeImage`.
3.  **`process_filters`**:
    - Parses the CSS filter string (e.g., `sepia(80%) contrast(1.2)`).
    - Maps CSS filters to Imagick operations:
      - **Grayscale**: Uses `modulateImage(100, 100 - value, 100)` to respect intensity.
      - **Sepia**: Uses a custom 6x6 color matrix (`applySepiaFilter`) to exactly match CSS `sepia()`.
      - **Brightness**: Uses a custom scaling matrix (`applyBrightnessFilter`) to exactly match CSS `brightness()`.
      - **Hue Rotate**: Uses a standard W3C rotation matrix (`applyHueRotateFilter`) to exactly match CSS `hue-rotate()`.
      - **Contrast**: Uses `brightnessContrastImage`.
      - **Saturate**: Uses `modulateImage`.

---

## Camera Access Implementation

### Step 1: Check Browser Support

```javascript
// First, verify the API exists
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  showToast("Camera not supported in this browser", "error");
  // Show error state in UI
  return;
}
```

### Step 2: Request Camera Permission

```javascript
// File: PhotoModal.js - setupCameraHandlers function

const setupCameraHandlers = async () => {
  // Get DOM elements from CameraView
  const video = overlay.querySelector("#camera-video");
  const loadingEl = overlay.querySelector("#camera-loading");
  const errorEl = overlay.querySelector("#camera-error");

  try {
    // Request camera with preferred constraints
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user", // Front-facing camera
        width: { ideal: 1280 }, // Preferred width
        height: { ideal: 720 }, // Preferred height (16:9 aspect)
      },
      audio: false, // No audio needed
    });

    // Connect stream to video element
    video.srcObject = mediaStream;

    // Wait for video to be ready
    await video.play();

    // Hide loading, show video
    loadingEl.classList.add("hidden");
    video.classList.remove("hidden");

    // Connect stream to filter preview thumbnails
    connectFiltersToStream(overlay, mediaStream);
  } catch (error) {
    handleCameraError(error, loadingEl, errorEl);
  }
};
```

### Step 3: Error Handling

```javascript
const handleCameraError = (error, loadingEl, errorEl) => {
  console.error("Camera access error:", error);

  // Hide loading spinner
  loadingEl.classList.add("hidden");

  // Show error message
  errorEl.classList.remove("hidden");
  errorEl.style.display = "flex";

  // Customize message based on error type
  const messageEl = errorEl.querySelector("p");

  switch (error.name) {
    case "NotAllowedError":
      messageEl.textContent =
        "Camera access denied. Please enable camera permissions.";
      break;
    case "NotFoundError":
      messageEl.textContent = "No camera found on this device.";
      break;
    case "NotReadableError":
      messageEl.textContent = "Camera is in use by another application.";
      break;
    default:
      messageEl.textContent = "Unable to access camera.";
  }
};
```

### Step 4: Cleanup on Exit

```javascript
// Called when leaving camera view or closing modal
const stopCamera = () => {
  if (mediaStream) {
    // Stop all tracks (video/audio)
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    mediaStream = null;
  }
};
```

---

## Preview Display System

### HTML Structure (CameraView.js)

```javascript
// File: src/frontend/components/photo-modal/CameraView.js (lines ~35-70)

export default function CameraView() {
  return /*html*/ `
        <div class="camera-view ...">
            <!-- Preview Container -->
            <div class="camera-preview-wrapper relative bg-gray-900 rounded-lg 
                        overflow-hidden aspect-video max-h-[320px] mx-auto">
                
                <!-- Live Video Preview -->
                <video 
                    id="camera-video" 
                    class="w-full h-full object-cover camera-preview-mirror"
                    autoplay
                    playsinline
                    muted
                ></video>

                <!-- Canvas for capture (hidden) -->
                <canvas 
                    id="camera-canvas" 
                    class="absolute inset-0 w-full h-full object-contain hidden"
                ></canvas>

                <!-- Captured image display -->
                <img 
                    id="captured-image" 
                    class="absolute inset-0 w-full h-full object-contain hidden"
                    alt="Captured"
                />

                <!-- Sticker overlay container -->
                <div id="camera-sticker-container" 
                     class="absolute inset-0 pointer-events-none">
                    <!-- Stickers added dynamically here -->
                </div>

                <!-- Loading state -->
                <div id="camera-loading" class="absolute inset-0 ...">
                    <div class="animate-spin ..."></div>
                    <p>Accessing camera...</p>
                </div>
            </div>
            
            <!-- Filter and Sticker controls below -->
            ${FilterList({ selectedFilter: "normal" })}
            ${StickerList({ selectedSticker: null })}
        </div>
    `;
}
```

### Video Mirroring (CSS)

The video is mirrored horizontally so users see themselves as in a mirror:

```javascript
// File: src/frontend/components/photo-modal/PhotoModalStyles.js (lines ~275-280)

export default function PhotoModalStyles() {
  return `
        .camera-preview-mirror {
            transform: scaleX(-1);  /* Flip horizontally */
        }
    `;
}
```

### Switching Between Video and Captured Image

```javascript
// After capturing
capturedImg.src = composedDataUrl;
capturedImg.classList.remove("hidden");
video.classList.add("hidden");
stickerContainer.classList.add("hidden"); // Stickers are baked into image

// After retaking
video.classList.remove("hidden");
capturedImg.classList.add("hidden");
stickerContainer.classList.remove("hidden");
stickerContainer.innerHTML = ""; // Clear stickers
placedStickers = []; // Reset state
```

---

## Filter System

### Filter Definition (FilterList.js)

```javascript
// File: src/frontend/components/photo-modal/FilterList.js

export const FILTERS = [
  { id: "normal", name: "Normal", css: "none" },
  { id: "grayscale", name: "B&W", css: "grayscale(100%)" },
  { id: "sepia", name: "Sepia", css: "sepia(80%)" },
  { id: "contrast", name: "Vivid", css: "contrast(130%) saturate(120%)" },
  { id: "brightness", name: "Bright", css: "brightness(120%)" },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(40%) contrast(90%) brightness(90%)",
  },
  { id: "cool", name: "Cool", css: "saturate(80%) hue-rotate(20deg)" },
  { id: "warm", name: "Warm", css: "saturate(110%) sepia(20%)" },
];
```

### Filter Thumbnail UI

Each filter shows a live preview with the filter applied:

```javascript
// File: src/frontend/components/photo-modal/FilterList.js

export default function FilterList({ selectedFilter = "normal" }) {
  const filterItems = FILTERS.map((filter) => {
    const isSelected = selectedFilter === filter.id;
    return /*html*/ `
            <button 
                class="filter-thumbnail flex flex-col items-center gap-1 p-1 rounded-lg 
                       ${isSelected ? "ring-2 ring-blue-500 scale-105" : ""}"
                data-filter-id="${filter.id}"
                data-filter-css="${filter.css}"
                data-filter-name="${filter.name}"
            >
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                    <!-- Live video preview with filter applied -->
                    <video 
                        class="filter-thumb-video w-full h-full object-cover"
                        style="filter: ${filter.css}; transform: scaleX(-1);"
                        autoplay muted playsinline
                    ></video>
                </div>
                <span class="text-xs text-gray-400">${filter.name}</span>
            </button>
        `;
  }).join("");

  return /*html*/ `
        <div class="filter-accordion ...">
            <!-- Accordion toggle button -->
            <button id="filter-accordion-toggle" class="...">
                <span>Filters</span>
                <span id="active-filter-badge">Normal</span>
            </button>
            
            <!-- Filter grid (hidden by default) -->
            <div id="filter-accordion-content" class="hidden">
                <div class="flex gap-2 p-3 overflow-x-auto">
                    ${filterItems}
                </div>
            </div>
        </div>
    `;
}
```

### Connecting Filters to Camera Stream

```javascript
// File: src/frontend/components/photo-modal/FilterList.js

/**
 * Connect all filter thumbnail videos to the same camera stream
 * @param {HTMLElement} container - The modal container
 * @param {MediaStream} stream - The camera MediaStream
 */
export function connectFiltersToStream(container, stream) {
  if (!container || !stream) return;

  // Find all video elements in filter thumbnails
  container.querySelectorAll(".filter-thumb-video").forEach((video) => {
    video.srcObject = stream;
  });
}
```

### Applying Filter to Live Preview

```javascript
// File: PhotoModal.js - inside setupCameraHandlers

// Setup filter button click handlers
overlay.querySelectorAll(".filter-thumbnail").forEach((btn) => {
  btn.onclick = () => {
    // Get filter data from button attributes
    const filterCss = btn.dataset.filterCss;
    const filterName = btn.dataset.filterName;
    const filterId = btn.dataset.filterId;

    // Update UI - highlight selected filter
    overlay.querySelectorAll(".filter-thumbnail").forEach((b) => {
      b.classList.remove("ring-2", "ring-blue-500", "scale-105");
    });
    btn.classList.add("ring-2", "ring-blue-500", "scale-105");

    // Update filter badge text
    const badge = overlay.querySelector("#active-filter-badge");
    if (badge) badge.textContent = filterName;

    // Store current filter for capture
    currentFilter = filterCss;

    // Get DOM elements
    const video = overlay.querySelector("#camera-video");
    const capturedImg = overlay.querySelector("#captured-image");
    const stickerContainer = overlay.querySelector("#camera-sticker-container");

    // Apply filter to video OR captured image
    if (!isCaptured) {
      // Live preview mode - apply to video
      video.style.filter = filterCss === "none" ? "" : filterCss;
      // Also apply to stickers so they match
      if (stickerContainer) {
        stickerContainer.style.filter = filterCss === "none" ? "" : filterCss;
      }
    } else {
      // Captured mode - apply to image
      capturedImg.style.filter = filterCss === "none" ? "" : filterCss;
      if (stickerContainer) {
        stickerContainer.style.filter = filterCss === "none" ? "" : filterCss;
      }
    }
  };
});
```

### Applying Filter During Capture

```javascript
// File: PhotoModal.js - capture button handler

captureBtn.onclick = () => {
  isCaptured = true;

  const canvas = overlay.querySelector("#camera-canvas");
  canvas.width = video.videoWidth; // Match video resolution
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  // Step 1: Draw video frame with filter
  ctx.save();
  ctx.filter = currentFilter === "none" ? "none" : currentFilter;
  ctx.translate(canvas.width, 0); // Move origin to right edge
  ctx.scale(-1, 1); // Flip horizontally (mirror)
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Step 2: Draw stickers with same filter
  ctx.filter = currentFilter === "none" ? "none" : currentFilter;
  // ... sticker drawing code (see Sticker section)

  // Export as data URL
  const composedDataUrl = canvas.toDataURL("image/png");
};
```

---

## Sticker System

### Sticker Definition

The application now exclusively supports **custom stickers** uploaded by the user. Default emoji stickers have been removed to streamline the experience.

### Sticker UI (`EditorView.js`)

The sticker panel allows users to upload custom images (PNG, JPG) which are then added to the canvas.

```javascript
// Custom sticker upload handler
container.querySelector("#custom-sticker-input").onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      stickerManager.add({ type: "image", imageUrl: evt.target.result });
    };
    reader.readAsDataURL(file);
  }
};
```

### Sticker Manager (`StickerManager.js`)

Manages the lifecycle of stickers on the frontend:

- **Adding**: Creates DOM elements for stickers.
- **Positioning**: Updates `x` and `y` coordinates (relative 0-1) based on drag events.
- **Scaling**: Updates `scale` based on resize events.
- **Removing**: Deletes stickers from the DOM and state.

---

## Custom Stickers

### File Input Handler

```javascript
// File: PhotoModal.js - inside setupStickerHandlers

const customInput = overlay.querySelector("#custom-sticker-input");
if (customInput) {
  customInput.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (no SVG allowed)
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only PNG, JPG, GIF, and WebP images are allowed", "error");
      customInput.value = "";
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (!dataUrl || typeof dataUrl !== "string") return;

      // Add thumbnail button to sticker list
      const customContainer = overlay.querySelector(
        "#custom-stickers-container"
      );
      if (customContainer) {
        const customBtn = document.createElement("button");
        customBtn.className =
          "custom-sticker-item w-10 h-10 rounded-lg overflow-hidden ...";
        customBtn.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover" />`;
        customBtn.dataset.stickerImage = dataUrl;
        customBtn.title = "Custom sticker (click to add)";

        // Click to add more of this sticker
        customBtn.onclick = () =>
          addCustomStickerToPreview(dataUrl, containerId);

        customContainer.appendChild(customBtn);
      }

      // Add sticker to preview immediately
      addCustomStickerToPreview(dataUrl, containerId);
    };
    reader.readAsDataURL(file);
    customInput.value = ""; // Reset for next upload
  };
}
```

### Creating Custom Sticker Element

```javascript
// File: PhotoModal.js

const addCustomStickerToPreview = (imageDataUrl, containerId) => {
  const id = Date.now();
  const container = overlay.querySelector(`#${containerId}`);
  if (!container) return;

  const stickerEl = document.createElement("div");
  stickerEl.className = "sticker-overlay sticker-image pointer-events-auto";
  stickerEl.dataset.stickerId = id;
  stickerEl.dataset.stickerType = "image";
  stickerEl.dataset.stickerImage = imageDataUrl;
  stickerEl.dataset.scale = "1";

  stickerEl.innerHTML = `
        <img src="${imageDataUrl}" class="sticker-custom-img" 
             alt="Custom sticker" 
             style="width: 64px; height: 64px; object-fit: contain;" />
        <button class="sticker-remove-btn" title="Remove sticker">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="sticker-resize-handle" title="Resize">
            <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
        </div>
    `;

  stickerEl.style.left = "50%";
  stickerEl.style.top = "50%";

  makeDraggable(stickerEl, container);
  makeResizable(stickerEl, container);

  // Setup remove handler
  const removeBtn = stickerEl.querySelector(".sticker-remove-btn");
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    stickerEl.remove();
    placedStickers = placedStickers.filter((s) => s.id !== id);
    updateStickerBadge();
  };

  container.appendChild(stickerEl);

  // Track with image type
  placedStickers.push({
    id,
    type: "image",
    imageUrl: imageDataUrl,
    element: stickerEl,
    scale: 1,
  });

  updateStickerBadge();
};
```

---

## Image Composition & Capture

### Frontend-Backend Communication (`ImageProcessor.js`)

When the user saves the photo, `processImageWithStickers` is called:

1.  **Prepare Data**:

    - **Image**: Original base64 data URL.
    - **Filters**: The active CSS filter string.
    - **Stickers**: Array of sticker objects.
      - `x`, `y`: Relative positions.
      - `scale`: Calculated relative to the visual canvas width (128px base size).
      - `imageUrl`: Base64 data of the custom sticker.

2.  **Send Request**:

    - POST to `/process-image`.
    - Payload includes `image`, `filter`, `stickers`, `canvasWidth`, `canvasHeight`.

3.  **Receive Result**:
    - Backend returns a JSON object with the processed image URL (`data:image/...`).
    - If backend fails, falls back to frontend canvas baking (for static images only).

### Data Flow Diagram

```
┌─────────────────┐
│  EditorView.js  │
└────────┬────────┘
         │ User adds stickers/filters
         ▼
┌─────────────────┐      ┌──────────────────┐
│ StickerManager  │      │ PhotoCompositor  │
│ (Tracks State)  │      │ (Visual Preview) │
└────────┬────────┘      └──────────────────┘
         │
         │ User clicks "Save"
         ▼
┌─────────────────┐
│ ImageProcessor  │
│ (Prepares Data) │
└────────┬────────┘
         │ POST /process-image
         │ { image, stickers, filter }
         ▼
┌─────────────────┐
│ MediaController │
└────────┬────────┘
         │ Calls ImageHelpers
         ▼
┌─────────────────┐
│  ImageHelpers   │
│  (Utils.php)    │
└────────┬────────┘
         │ 1. Decode Image
         │ 2. Apply Stickers (Imagick::composite)
         │ 3. Apply Filters (Color Matrices)
         ▼
    Processed Image (Base64)
```

### PhotoCompositor Class

```javascript
// File: src/frontend/components/photo-modal/PhotoPreview.js

export class PhotoCompositor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.baseImage = null;
    this.filter = "none";
    this.stickers = [];
  }

  async loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.baseImage = img;
        this.canvas.width = img.naturalWidth || img.width;
        this.canvas.height = img.naturalHeight || img.height;
        this.render();
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  setFilter(filterCss) {
    this.filter = filterCss;
    this.render();
  }

  addSticker(sticker) {
    this.stickers.push({
      id: sticker.id || Date.now(),
      type: sticker.type || "emoji",
      emoji: sticker.emoji,
      imageUrl: sticker.imageUrl,
      x: sticker.x ?? 0.5,
      y: sticker.y ?? 0.5,
      size: sticker.size || 48,
      scale: sticker.scale || 1,
    });
    return this.stickers[this.stickers.length - 1];
  }

  removeSticker(id) {
    this.stickers = this.stickers.filter((s) => s.id !== id);
  }

  updateStickerPosition(id, x, y) {
    const sticker = this.stickers.find((s) => s.id === id);
    if (sticker) {
      sticker.x = x;
      sticker.y = y;
    }
  }

  render() {
    if (!this.baseImage) return;

    const { ctx, canvas, baseImage, filter, stickers } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filter === "none" ? "none" : filter;
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    // Only draw emoji stickers (image stickers are in base image)
    stickers.forEach((sticker) => {
      if (sticker.type === "image") return;
      if (!sticker.emoji) return;

      const x = sticker.x * canvas.width;
      const y = sticker.y * canvas.height;
      const scale = sticker.scale || 1;
      const fontSize = sticker.size * (canvas.width / 400) * scale;

      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sticker.emoji, x, y);
    });
  }

  export(type = "image/png", quality = 0.92) {
    this.render();
    return this.canvas.toDataURL(type, quality);
  }

  exportBlob(type = "image/png", quality = 0.92) {
    return new Promise((resolve) => {
      this.render();
      this.canvas.toBlob(resolve, type, quality);
    });
  }
}
```

---

## Validation & Error Handling

### Camera Validation

```javascript
// Check browser support
const isCameraSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Camera permission states
const checkCameraPermission = async () => {
  try {
    const result = await navigator.permissions.query({ name: "camera" });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return "unknown";
  }
};
```

### File Validation

```javascript
// Allowed image types (no SVG)
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push("No file selected");
    return { valid: false, errors };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(
      `Invalid file type: ${file.type}. Allowed: PNG, JPG, GIF, WebP`
    );
  }

  if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
    errors.push("SVG files are not allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

### Image Dimension Validation

```javascript
const validateImageDimensions = (file, minWidth = 100, minHeight = 100) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image too small. Minimum: ${minWidth}x${minHeight}px`,
        });
      } else {
        resolve({ valid: true, width: img.width, height: img.height });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: "Failed to load image" });
    };

    img.src = url;
  });
};
```

### Description Validation

```javascript
const MAX_DESCRIPTION_LENGTH = 2200;

const validateDescription = (text) => {
  if (text.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description too long: ${text.length}/${MAX_DESCRIPTION_LENGTH}`,
    };
  }
  return { valid: true, length: text.length };
};
```

### Sticker Limit

```javascript
const MAX_STICKERS = 20;

const canAddSticker = () => {
  if (placedStickers.length >= MAX_STICKERS) {
    showToast(`Maximum ${MAX_STICKERS} stickers allowed`, "warning");
    return false;
  }
  return true;
};
```

---

## Data Flow

### Complete Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       PhotoModal.js                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     STATE                                │ │
│  │  currentView, mediaStream, isCaptured, compositor,       │ │
│  │  currentFilter, placedStickers, finalImageDataUrl        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                               │
│        ┌─────────────────────┼─────────────────────┐         │
│        ▼                     ▼                     ▼         │
│  ┌───────────┐       ┌───────────┐         ┌───────────┐     │
│  │ Camera    │       │ Upload    │         │ Confirm   │     │
│  │ View      │       │ View      │         │ View      │     │
│  └─────┬─────┘       └─────┬─────┘         └─────┬─────┘     │
│        │                   │                     │           │
│        └─────────┬─────────┘                     │           │
│                  ▼                               │           │
│        ┌─────────────────┐                       │           │
│        │  FilterList +   │                       │           │
│        │  StickerList    │                       │           │
│        └────────┬────────┘                       │           │
│                 │                                │           │
│                 ▼                                │           │
│        ┌─────────────────┐                       │           │
│        │ PhotoCompositor │◄──────────────────────┘           │
│        │   - render()    │                                   │
│        │   - export()    │                                   │
│        └────────┬────────┘                                   │
│                 │                                            │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  ▼
         ┌───────────────┐
         │  Data URL     │
         │  (PNG/JPEG)   │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │   Upload to   │
         │    Server     │
         └───────────────┘
```

### Filter Data Flow

```
FILTERS array (FilterList.js)
         │
         ▼
FilterList component renders buttons with data-filter-css
         │
         ▼
User clicks filter button
         │
         ▼
Click handler reads btn.dataset.filterCss
         │
         ▼
Stores in currentFilter variable
         │
         ├──► Apply to video.style.filter (live preview)
         │
         └──► Apply to ctx.filter during canvas capture
```

### Sticker Data Flow

```
STICKERS array (StickerList.js) OR Custom upload
         │
         ▼
User clicks sticker button or uploads image
         │
         ▼
Create DOM element with position, scale
         │
         ▼
Add to placedStickers array: { id, emoji/imageUrl, element, scale }
         │
         ▼
User drags/resizes → Update element style + placedStickers[].scale
         │
         ▼
Capture: Loop through placedStickers
         │
         ├──► Read element.style.left/top → Convert to canvas coords
         │
         ├──► Read scale from stickerData.scale
         │
         └──► Draw to canvas with ctx.drawImage or ctx.fillText
```

---

## Summary

The photo modal system is a complex but well-organized component that handles:

1.  **Camera Access** via MediaDevices API with comprehensive error handling
2.  **Live Preview** with CSS mirroring and filter application
3.  **Filters** defined as CSS filter strings, applied to both video and stickers
4.  **Stickers** with drag, resize, and delete functionality for both emoji and custom images
5.  **Image Composition** using Canvas API to merge video frame + filter + stickers
6.  **Validation** at multiple levels: file type, size, dimensions, sticker count

All state is managed within the PhotoModal function closure, making the component self-contained and easy to integrate.
