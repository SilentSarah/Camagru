/*
 * File Created: Tuesday, 31st December 2025
 * Author: Camagru Team
 * 
 * EditorPage - Full-featured photo editor page
 * 
 * Features:
 * - Main canvas with live camera feed or uploaded/drafted image
 * - Filters panel (right side) with mini previews
 * - Stickers section with custom upload capability
 * - Drafts section (below canvas) with horizontal scroll
 * - Three input modes: camera, file upload, draft selection
 */

import { PhotoCompositor } from '../utils/PhotoCompositor.js';
import { DraftStorage } from '../utils/DraftStorage.js';
import { getCookie, goTo } from '../js/Utils.js';
import { showToast } from '../components/Toast.js';
import FetchCSRF from '../js/Csrf.js';
import { abortController } from '../js/Router.js';
import apiFetch from '../js/ApiClient.js';

// Predefined filters
const FILTERS = [
    { id: 'normal', name: 'Normal', css: 'none' },
    { id: 'grayscale', name: 'B&W', css: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(80%)' },
    { id: 'contrast', name: 'Vivid', css: 'contrast(130%) saturate(120%)' },
    { id: 'brightness', name: 'Bright', css: 'brightness(120%)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(90%) brightness(90%)' },
    { id: 'cool', name: 'Cool', css: 'saturate(80%) hue-rotate(20deg)' },
    { id: 'warm', name: 'Warm', css: 'saturate(110%) sepia(20%)' },
];

/**
 * Injects styles for the editor page
 */
function injectEditorStyles() {
    if (document.getElementById('editor-page-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'editor-page-styles';
    style.innerHTML = `
        .editor-page .drafts-scroll::-webkit-scrollbar {
            height: 6px;
        }
        .editor-page .drafts-scroll::-webkit-scrollbar-track {
            background: #262626;
            border-radius: 3px;
        }
        .editor-page .drafts-scroll::-webkit-scrollbar-thumb {
            background: #525252;
            border-radius: 3px;
        }
        .editor-page .drafts-scroll::-webkit-scrollbar-thumb:hover {
            background: #737373;
        }
        .sticker-overlay {
            position: absolute;
            user-select: none;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            transform-origin: center center;
        }
        .sticker-overlay:active {
            cursor: grabbing;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        .sticker-overlay .controls {
            display: none;
        }
        .sticker-overlay:hover .controls,
        .sticker-overlay:active .controls {
            display: block;
        }
        .sticker-delete {
            position: absolute;
            top: -12px;
            right: -12px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 10;
        }
        .sticker-resize {
            position: absolute;
            bottom: -12px;
            right: -12px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            cursor: nwse-resize;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 10;
        }
        .custom-sticker-item {
            width: 64px;
            height: 64px;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
        }
        .custom-sticker-item:hover {
            border-color: #3b82f6;
            transform: scale(1.05);
        }
        .custom-sticker-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Creates and returns the Editor page as a DOM element
 * @returns {Promise<HTMLElement>}
 */
export default async function EditorPage() {
    injectEditorStyles();
    
    const drafts = DraftStorage.getDrafts();
    
    const container = document.createElement('div');
    // ml-16 for sidebar on desktop, pb-16 for mobile bottom bar
    container.className = 'editor-page flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden md:ml-16 pb-16 md:pb-0';
    
    container.innerHTML = `
        <!-- Header - Compact on mobile -->
        <header class="editor-header flex items-center justify-between px-3 md:px-6 py-2 md:py-4 border-b border-neutral-800 shrink-0">
            <h1 class="text-lg md:text-xl font-semibold">Photo Editor</h1>
            <div class="flex gap-2">
                <button id="btn-camera-mode" class="px-2 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs md:text-sm font-medium transition-colors">
                    <i class="fa-solid fa-camera md:mr-2"></i><span class="hidden md:inline">Camera</span>
                </button>
                <button id="btn-upload-mode" class="px-2 md:px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs md:text-sm font-medium transition-colors">
                    <i class="fa-solid fa-upload md:mr-2"></i><span class="hidden md:inline">Upload</span>
                </button>
                <input type="file" id="upload-input" class="hidden" accept="image/*">
            </div>
        </header>

        <!-- Main Content Area - Flex column on mobile, row on desktop -->
        <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
            <!-- Main Editor Area -->
            <div class="flex-1 flex flex-col overflow-hidden min-h-0">
                <!-- Canvas Area -->
                <div class="flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden relative" id="canvas-wrapper">
                    <!-- Camera Video (default visible) -->
                    <video id="camera-video" class="w-full h-full object-contain" autoplay playsinline muted></video>
                    
                    <!-- Image Canvas (hidden by default) -->
                    <div id="canvas-container" class="absolute inset-0 items-center justify-center hidden">
                        <canvas id="editor-canvas" class="block max-w-full max-h-full"></canvas>
                    </div>
                    
                    <!-- Sticker Layer (overlays both video and canvas) -->
                    <div id="sticker-layer" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
                    
                    <!-- Placeholder when nothing is loaded -->
                    <div id="placeholder-message" class="hidden absolute inset-0 items-center justify-center text-neutral-500 flex-col">
                        <i class="fa-solid fa-image text-4xl md:text-6xl mb-4"></i>
                        <p class="text-sm md:text-lg">Select an image or use the camera</p>
                    </div>
                </div>

                <!-- Drafts Section - Hidden on mobile, visible on desktop -->
                <div class="drafts-section hidden md:block border-t border-neutral-800 bg-neutral-900 p-4 shrink-0">
                    <h3 class="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wide">Drafts</h3>
                    <div class="drafts-scroll flex gap-3 overflow-x-auto pb-2" id="drafts-container">
                        ${drafts.length === 0 ? `
                            <div class="text-neutral-600 text-sm italic">No drafts yet. Take a photo or upload an image to create drafts.</div>
                        ` : drafts.map((draft, index) => `
                            <div class="draft-item shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all" 
                                 data-draft-id="${draft.id}" 
                                 data-index="${index}">
                                <img src="${draft.thumbnail || draft.imageUrl}" 
                                     class="w-20 h-20 object-cover pointer-events-none" 
                                     alt="Draft ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Controls Panel - Bottom on mobile, right side on desktop -->
            <div class="controls-panel w-full md:w-80 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col shrink-0 max-h-[40vh] md:max-h-none">
                <!-- Tabs -->
                <div class="flex border-b border-neutral-800 shrink-0">
                    <button class="flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold text-white border-b-2 border-white transition-colors" id="tab-filters">
                        Filters
                    </button>
                    <button class="flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors" id="tab-stickers">
                        Stickers
                    </button>
                    <button class="flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors md:hidden" id="tab-drafts-mobile">
                        Drafts
                    </button>
                </div>

                <!-- Filters Panel - Horizontal scroll on mobile -->
                <div id="panel-filters" class="flex-1 overflow-auto p-2 md:p-4">
                    <div class="flex md:grid md:grid-cols-3 gap-2 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        ${FILTERS.map(f => `
                            <div class="filter-btn flex flex-col items-center gap-1 md:gap-2 cursor-pointer group shrink-0" 
                                 data-filter="${f.css}" 
                                 data-filter-id="${f.id}">
                                <div class="filter-preview w-14 h-14 md:w-20 md:h-20 rounded-lg bg-neutral-700 overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all flex items-center justify-center ${f.id === 'normal' ? 'border-blue-500' : ''}">
                                    <div class="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-lg md:text-2xl" style="filter: ${f.css}">
                                        <i class="fa-solid fa-image text-neutral-500"></i>
                                    </div>
                                </div>
                                <span class="text-[10px] md:text-xs text-neutral-400 group-hover:text-white transition-colors ${f.id === 'normal' ? 'text-blue-500' : ''}">${f.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Stickers Panel -->
                <div id="panel-stickers" class="flex-1 hidden overflow-auto p-2 md:p-4">
                    <div class="mb-2 md:mb-4">
                        <h4 class="text-neutral-400 font-semibold mb-2 md:mb-3 text-xs uppercase tracking-wide">Custom Stickers</h4>
                        <div class="flex md:grid md:grid-cols-4 gap-2 overflow-x-auto md:overflow-visible" id="stickers-grid">
                            <!-- Upload Button -->
                            <label class="sticker-upload-btn w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border-2 border-dashed border-neutral-600 rounded-lg hover:border-blue-500 hover:bg-neutral-800 cursor-pointer transition-all shrink-0">
                                <i class="fa-solid fa-plus text-lg md:text-xl text-neutral-400"></i>
                                <input type="file" id="sticker-input" class="hidden" accept="image/png,image/jpeg,image/gif">
                            </label>
                            <!-- Uploaded stickers will be added here -->
                        </div>
                    </div>
                    
                    <p class="text-[10px] md:text-xs text-neutral-500 mt-2 md:mt-4 hidden md:block">
                        <i class="fa-solid fa-info-circle mr-1"></i>
                        Upload images to use as stickers. Click a sticker to add it to the canvas.
                    </p>
                </div>

                <!-- Mobile Drafts Panel -->
                <div id="panel-drafts-mobile" class="flex-1 hidden overflow-auto p-2 md:hidden">
                    <div class="flex gap-2 overflow-x-auto pb-2" id="drafts-container-mobile">
                        ${drafts.length === 0 ? `
                            <div class="text-neutral-600 text-xs italic">No drafts yet.</div>
                        ` : drafts.map((draft, index) => `
                            <div class="draft-item shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all" 
                                 data-draft-id="${draft.id}" 
                                 data-index="${index}">
                                <img src="${draft.thumbnail || draft.imageUrl}" 
                                     class="w-14 h-14 object-cover pointer-events-none" 
                                     alt="Draft ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="p-2 md:p-4 border-t border-neutral-800 flex md:flex-col gap-2 shrink-0">
                    <button id="btn-next" class="flex-1 md:w-full py-2 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg text-sm md:font-semibold transition-colors flex items-center justify-center gap-2" disabled>
                        <i class="fa-solid fa-arrow-right"></i>
                        <span class="hidden md:inline">Next</span>
                    </button>
                </div>
            </div>
        </div>


        <!-- Share View (hidden by default) -->
        <div id="share-view" class="hidden absolute inset-0 bg-neutral-950 z-50 flex-col">
            <!-- Share Header -->
            <header class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                <button id="btn-back-editor" class="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </button>
                <h1 class="text-xl font-semibold">Create Post</h1>
                <button id="btn-post" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors">
                    Post
                </button>
            </header>
            
            <!-- Share Content -->
            <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <!-- Image Preview -->
                <div class="flex-1 bg-neutral-900 flex items-center justify-center p-4 overflow-hidden">
                    <img id="share-preview-image" class="max-w-full max-h-full object-contain rounded-lg" alt="Preview">
                </div>
                
                <!-- Caption Input -->
                <div class="w-full lg:w-96 bg-neutral-900 border-t lg:border-t-0 lg:border-l border-neutral-800 p-4 flex flex-col">
                    <textarea 
                        id="caption-input" 
                        class="w-full flex-1 lg:h-48 bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Write a caption..."
                        maxlength="255"
                    ></textarea>
                    <div class="mt-2 text-xs text-neutral-500 text-right">
                        <span id="caption-count">0</span>/255
                    </div>
                </div>
            </div>
        </div>
    `;

    attachEventListeners(container);
    
    return container;
}

/**
 * Attaches all event listeners to the editor page
 * @param {HTMLElement} container 
 */
function attachEventListeners(container) {
    let currentMode = 'camera';
    let currentFilter = 'none';
    let mediaStream = null;
    let compositor = null;
    let customStickers = [];
    let appliedStickers = [];
    let hasModifications = false; 
    let pendingImageUrl = null;   
    let pendingRawImageUrl = null; 
    let originalFileBlob = null;
    let originalFileMimeType = null;
 

    const cameraVideo = container.querySelector('#camera-video');
    const canvasContainer = container.querySelector('#canvas-container');
    const editorCanvas = container.querySelector('#editor-canvas');
    const stickerLayer = container.querySelector('#sticker-layer');
    const placeholderMessage = container.querySelector('#placeholder-message');
    const uploadInput = container.querySelector('#upload-input');
    const stickerInput = container.querySelector('#sticker-input');
    const stickersGrid = container.querySelector('#stickers-grid');
    const draftsContainer = container.querySelector('#drafts-container');
    
    const btnCameraMode = container.querySelector('#btn-camera-mode');
    const btnUploadMode = container.querySelector('#btn-upload-mode');
    const btnNext = container.querySelector('#btn-next');
    
    const tabFilters = container.querySelector('#tab-filters');
    const tabStickers = container.querySelector('#tab-stickers');
    const tabDraftsMobile = container.querySelector('#tab-drafts-mobile');
    const panelFilters = container.querySelector('#panel-filters');
    const panelStickers = container.querySelector('#panel-stickers');
    const panelDraftsMobile = container.querySelector('#panel-drafts-mobile');
    const draftsContainerMobile = container.querySelector('#drafts-container-mobile');
    
    const shareView = container.querySelector('#share-view');
    const btnBackEditor = container.querySelector('#btn-back-editor');
    const btnPost = container.querySelector('#btn-post');
    const sharePreviewImage = container.querySelector('#share-preview-image');
    const captionInput = container.querySelector('#caption-input');
    const captionCount = container.querySelector('#caption-count');

    compositor = new PhotoCompositor(editorCanvas);
    
    let hasImageLoaded = false; 
    
    const updateNextButtonState = () => {
        const hasFilterChange = currentFilter !== 'none';
        const hasStickers = appliedStickers.length > 0;
        hasModifications = hasFilterChange || hasStickers;
        
        if (currentMode === 'camera') {
            btnNext.disabled = !hasModifications;
        } else {
            btnNext.disabled = !(hasImageLoaded || hasModifications);
        }
    };

    const showCameraMode = async () => {
        currentMode = 'camera';
        cameraVideo.classList.remove('hidden');
        canvasContainer.classList.add('hidden');
        placeholderMessage.classList.add('hidden');
        placeholderMessage.classList.remove('flex');
        
        btnCameraMode.classList.remove('bg-neutral-800');
        btnCameraMode.classList.add('bg-blue-600');
        btnUploadMode.classList.remove('bg-blue-600');
        btnUploadMode.classList.add('bg-neutral-800');
        

        
        clearStickers();
        currentFilter = 'none';
        hasImageLoaded = false; 
        await startCamera();
        updateFilterPreviews(null);
        updateNextButtonState();
    };

    const showImageMode = async (imageUrl, filter = 'none', stickers = []) => {
        currentMode = 'image';
        hasImageLoaded = true; 
        cameraVideo.classList.add('hidden');
        canvasContainer.classList.remove('hidden');
        canvasContainer.classList.add('flex');
        placeholderMessage.classList.add('hidden');
        placeholderMessage.classList.remove('flex');
        
        btnCameraMode.classList.remove('bg-blue-600');
        btnCameraMode.classList.add('bg-neutral-800');
        btnUploadMode.classList.remove('bg-neutral-800');
        btnUploadMode.classList.add('bg-blue-600');
        

        
        stopCamera();
        clearStickers();
        
        const resizedUrl = await PhotoCompositor.resizeImage(imageUrl);
        await compositor.loadImage(resizedUrl);
        compositor.setFilter(filter);
        currentFilter = filter;
        stickerLayer.style.filter = filter === 'none' ? '' : filter;
        
        if (stickers && stickers.length > 0) {
            stickers.forEach(s => addStickerToLayer(s));
        }
        
        updateFilterPreviews(resizedUrl);
        updateFilterButtonStates(filter);
        updateStickerLayerPosition();
        updateNextButtonState();
    };

    const startCamera = async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            cameraVideo.srcObject = mediaStream;
            cameraVideo.style.filter = currentFilter === 'none' ? '' : currentFilter;
            stickerLayer.style.filter = currentFilter === 'none' ? '' : currentFilter;
            
            cameraVideo.onloadedmetadata = () => {
                updateStickerLayerPosition();
            };
        } catch (e) {
            placeholderMessage.classList.remove('hidden');
            placeholderMessage.classList.add('flex');
            cameraVideo.classList.add('hidden');
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    };

    const updateFilterPreviews = (imageUrl) => {
        const filterBtns = container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            const preview = btn.querySelector('.filter-preview');
            const filterCss = btn.dataset.filter;
            
            if (imageUrl) {
                preview.innerHTML = `<img src="${imageUrl}" class="w-full h-full object-cover" style="filter: ${filterCss}">`;
            } else {
                preview.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-2xl" style="filter: ${filterCss}">
                        <i class="fa-solid fa-camera text-neutral-500"></i>
                    </div>
                `;
            }
        });
    };

    const updateFilterButtonStates = (selectedFilter) => {
        container.querySelectorAll('.filter-btn').forEach(btn => {
            const preview = btn.querySelector('.filter-preview');
            const label = btn.querySelector('span');
            
            if (btn.dataset.filter === selectedFilter) {
                preview.classList.add('border-blue-500');
                label.classList.add('text-blue-500');
                label.classList.remove('text-neutral-400');
            } else {
                preview.classList.remove('border-blue-500');
                label.classList.remove('text-blue-500');
                label.classList.add('text-neutral-400');
            }
        });
    };

    const applyFilter = (filterCss) => {
        currentFilter = filterCss;
        
        if (currentMode === 'camera') {
            cameraVideo.style.filter = filterCss === 'none' ? '' : filterCss;
        } else {
            compositor.setFilter(filterCss);
        }
        
        stickerLayer.style.filter = filterCss === 'none' ? '' : filterCss;
        updateFilterButtonStates(filterCss);
        updateNextButtonState();
    };

    const clearStickers = () => {
        stickerLayer.innerHTML = '';
        appliedStickers = [];
        updateNextButtonState();
    };

    const addStickerToLayer = (stickerData) => {
        const id = stickerData.id || Date.now() + Math.random();
        const el = document.createElement('div');
        el.className = 'sticker-overlay pointer-events-auto';
        el.style.left = `${(stickerData.x || 0.5) * 100}%`;
        el.style.top = `${(stickerData.y || 0.5) * 100}%`;
        
        const scale = stickerData.scale || 1;
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        el.innerHTML = `
            <img src="${stickerData.imageUrl}" class="w-32 shrink-0 pointer-events-none">
            <div class="controls">
                <div class="sticker-delete"><i class="fa-solid fa-xmark"></i></div>
                <div class="sticker-resize"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></div>
            </div>
        `;
        
        stickerLayer.appendChild(el);
        
        const stickerObj = {
            id,
            type: 'image',
            imageUrl: stickerData.imageUrl,
            x: stickerData.x || 0.5,
            y: stickerData.y || 0.5,
            scale,
            element: el
        };
        
        appliedStickers.push(stickerObj);
        setupStickerInteractions(stickerObj);
        updateNextButtonState();
        
        return stickerObj;
    };

    const setupStickerInteractions = (stickerObj) => {
        const el = stickerObj.element;
        let isDragging = false;
        let startMouseX, startMouseY;
        let startObjX, startObjY;

        const updateTransform = () => {
            el.style.transform = `translate(-50%, -50%) scale(${stickerObj.scale})`;
        };

        const getEventPos = (e) => {
            if (e.touches && e.touches.length > 0) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        };

        const startDrag = (e) => {
            if (e.target.closest('.sticker-resize') || e.target.closest('.sticker-delete')) return;
            isDragging = true;
            const pos = getEventPos(e);
            startMouseX = pos.x;
            startMouseY = pos.y;
            startObjX = stickerObj.x;
            startObjY = stickerObj.y;
            el.style.cursor = 'grabbing';
            e.stopPropagation();
            if (e.type === 'touchstart') e.preventDefault();
        };

        const onGlobalMove = (e) => {
            if (!isDragging) return;
            
            const layerRect = stickerLayer.getBoundingClientRect();
            if (layerRect.width === 0 || layerRect.height === 0) return;

            const pos = getEventPos(e);
            const deltaX = pos.x - startMouseX;
            const deltaY = pos.y - startMouseY;

            let newX = startObjX + (deltaX / layerRect.width);
            let newY = startObjY + (deltaY / layerRect.height);
            
            newX = Math.max(0, Math.min(1, newX));
            newY = Math.max(0, Math.min(1, newY));

            el.style.left = `${newX * 100}%`;
            el.style.top = `${newY * 100}%`;
            
            stickerObj.x = newX;
            stickerObj.y = newY;
        };

        const onGlobalUp = () => {
            if (isDragging) {
                isDragging = false;
                el.style.cursor = 'grab';
            }
        };

        el.onmousedown = startDrag;
        document.addEventListener('mousemove', onGlobalMove);
        document.addEventListener('mouseup', onGlobalUp);
        
        el.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', onGlobalMove, { passive: true });
        document.addEventListener('touchend', onGlobalUp);

        const resizeHandle = el.querySelector('.sticker-resize');
        let isResizing = false;
        let resizeStartX = 0;
        let resizeStartScale = 1;
        
        const startResize = (e) => {
            e.stopPropagation();
            if (e.type === 'touchstart') e.preventDefault();
            isResizing = true;
            const pos = getEventPos(e);
            resizeStartX = pos.x;
            resizeStartScale = stickerObj.scale;
        };
        
        const onResizeMove = (e) => {
            if (!isResizing) return;
            const pos = getEventPos(e);
            const diff = pos.x - resizeStartX;
            const newScale = Math.max(0.3, resizeStartScale + (diff / 100));
            stickerObj.scale = newScale;
            updateTransform();
        };
        
        const onResizeUp = () => {
            isResizing = false;
        };
        
        resizeHandle.addEventListener('mousedown', startResize);
        resizeHandle.addEventListener('touchstart', startResize, { passive: false });
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('touchmove', onResizeMove, { passive: true });
        document.addEventListener('mouseup', onResizeUp);
        document.addEventListener('touchend', onResizeUp);

        el.querySelector('.sticker-delete').onclick = (e) => {
            e.stopPropagation();
            el.remove();
            appliedStickers = appliedStickers.filter(s => s.id !== stickerObj.id);
            updateNextButtonState();
        };
    };

    const updateStickerLayerPosition = () => {
        const wrapperRect = container.querySelector('#canvas-wrapper').getBoundingClientRect();
        
        if (currentMode === 'image') {
            const canvasRect = editorCanvas.getBoundingClientRect();
            stickerLayer.style.left = `${canvasRect.left - wrapperRect.left}px`;
            stickerLayer.style.top = `${canvasRect.top - wrapperRect.top}px`;
            stickerLayer.style.width = `${canvasRect.width}px`;
            stickerLayer.style.height = `${canvasRect.height}px`;
        } else if (currentMode === 'camera' && cameraVideo.videoWidth && cameraVideo.videoHeight) {
            const videoRatio = cameraVideo.videoWidth / cameraVideo.videoHeight;
            const wrapperRatio = wrapperRect.width / wrapperRect.height;
            
            let displayWidth, displayHeight, offsetX, offsetY;
            
            if (videoRatio > wrapperRatio) {
                displayWidth = wrapperRect.width;
                displayHeight = displayWidth / videoRatio;
                offsetX = 0;
                offsetY = (wrapperRect.height - displayHeight) / 2;
            } else {
                displayHeight = wrapperRect.height;
                displayWidth = displayHeight * videoRatio;
                offsetX = (wrapperRect.width - displayWidth) / 2;
                offsetY = 0;
            }
            
            stickerLayer.style.left = `${offsetX}px`;
            stickerLayer.style.top = `${offsetY}px`;
            stickerLayer.style.width = `${displayWidth}px`;
            stickerLayer.style.height = `${displayHeight}px`;
        } else {
            stickerLayer.style.left = '0';
            stickerLayer.style.top = '0';
            stickerLayer.style.width = '100%';
            stickerLayer.style.height = '100%';
        }
        stickerLayer.style.right = 'auto';
        stickerLayer.style.bottom = 'auto';
    };

    const addCustomSticker = (imageUrl) => {
        const id = Date.now();
        customStickers.push({ id, imageUrl });
        
        const item = document.createElement('div');
        item.className = 'custom-sticker-item';
        item.dataset.stickerId = id;
        item.innerHTML = `<img src="${imageUrl}" alt="Custom sticker">`;
        
        const uploadBtn = stickersGrid.querySelector('.sticker-upload-btn');
        uploadBtn.parentNode.insertBefore(item, uploadBtn.nextSibling);
        
        item.onclick = () => {
            addStickerToLayer({ imageUrl, x: 0.5, y: 0.5, scale: 1 });
        };
    };

    const switchTab = (tab) => {
        const activeClass = 'flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold text-white border-b-2 border-white transition-colors';
        const inactiveClass = 'flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors';
        const inactiveMobileClass = 'flex-1 py-3 md:py-4 text-xs md:text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors md:hidden';
        
        tabFilters.className = inactiveClass;
        tabStickers.className = inactiveClass;
        if (tabDraftsMobile) tabDraftsMobile.className = inactiveMobileClass;
        
        panelFilters.classList.add('hidden');
        panelStickers.classList.add('hidden');
        if (panelDraftsMobile) panelDraftsMobile.classList.add('hidden');
        
        if (tab === 'filters') {
            tabFilters.className = activeClass;
            panelFilters.classList.remove('hidden');
        } else if (tab === 'stickers') {
            tabStickers.className = activeClass;
            panelStickers.classList.remove('hidden');
        } else if (tab === 'drafts-mobile') {
            if (tabDraftsMobile) tabDraftsMobile.className = activeClass.replace('md:hidden', '') + ' md:hidden';
            if (panelDraftsMobile) panelDraftsMobile.classList.remove('hidden');
        }
    };

    const captureOrSave = async () => {
        let dataUrl;
        
        if (currentMode === 'camera') {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cameraVideo.videoWidth;
            tempCanvas.height = cameraVideo.videoHeight;
            const ctx = tempCanvas.getContext('2d');
            
            ctx.filter = currentFilter === 'none' ? 'none' : currentFilter;
            ctx.drawImage(cameraVideo, 0, 0);
            
            await bakeStickersToContext(ctx, tempCanvas.width, tempCanvas.height);
            
            dataUrl = tempCanvas.toDataURL('image/png');
        } else {
            const visualWidth = stickerLayer.offsetWidth || editorCanvas.offsetWidth || editorCanvas.width;
            const scaleMultiplier = editorCanvas.width / visualWidth;
            
            await compositor.bakeStickers(appliedStickers.map(s => ({
                type: s.type,
                imageUrl: s.imageUrl,
                x: s.x,
                y: s.y,
                scale: (s.scale || 1) * scaleMultiplier
            })));
            dataUrl = compositor.export();
        }
        
        const generateThumbnail = (sourceUrl, maxSize = 160) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.onerror = () => resolve(sourceUrl);
                img.src = sourceUrl;
            });
        };
        
        const compressImage = (sourceUrl) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 800;
                    const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = () => resolve(sourceUrl);
                img.src = sourceUrl;
            });
        };
        
        const thumbnail = await generateThumbnail(dataUrl);
        const compressedImage = await compressImage(dataUrl);
        
        DraftStorage.saveDraft({
            thumbnail: thumbnail,
            imageUrl: compressedImage,
            filter: 'none', 
            stickers: []    
        });
        
        refreshDrafts();
        clearStickers();
        showToast('Draft saved!', 'success');
    };

    const bakeStickersToContext = async (ctx, canvasWidth, canvasHeight) => {
        ctx.filter = currentFilter === 'none' ? 'none' : currentFilter;
        
        const visualWidth = stickerLayer.offsetWidth || cameraVideo.offsetWidth || canvasWidth;
        const visualHeight = stickerLayer.offsetHeight || cameraVideo.offsetHeight || canvasHeight;
        const scaleMultiplierX = canvasWidth / visualWidth;
        const scaleMultiplierY = canvasHeight / visualHeight;
        
        for (const sticker of appliedStickers) {
            const x = sticker.x * canvasWidth;
            const y = sticker.y * canvasHeight;
            const scale = sticker.scale || 1;
            
            ctx.save();
            ctx.translate(x, y);
            
            if (sticker.type === 'image' && sticker.imageUrl) {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const avgMultiplier = (scaleMultiplierX + scaleMultiplierY) / 2;
                        const baseWidth = 128 * scale * avgMultiplier;
                        const aspectRatio = img.naturalHeight / img.naturalWidth;
                        const width = baseWidth;
                        const height = baseWidth * aspectRatio;
                        ctx.drawImage(img, -width/2, -height/2, width, height);
                        resolve();
                    };
                    img.onerror = resolve;
                    img.src = sticker.imageUrl;
                });
            }
            
            ctx.restore();
        }
    };

    const refreshDrafts = () => {
        const drafts = DraftStorage.getDrafts();
        
        const emptyDesktop = `<div class="text-neutral-600 text-sm italic">No drafts yet. Take a photo or upload an image to create drafts.</div>`;
        const emptyMobile = `<div class="text-neutral-600 text-xs italic">No drafts yet.</div>`;
        
        const desktopHtml = drafts.length === 0 ? emptyDesktop : drafts.map((draft, index) => `
            <div class="draft-item shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all" 
                 data-draft-id="${draft.id}" 
                 data-index="${index}">
                <img src="${draft.thumbnail || draft.imageUrl}" 
                     class="w-20 h-20 object-cover pointer-events-none" 
                     alt="Draft ${index + 1}">
            </div>
        `).join('');
        
        const mobileHtml = drafts.length === 0 ? emptyMobile : drafts.map((draft, index) => `
            <div class="draft-item shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all" 
                 data-draft-id="${draft.id}" 
                 data-index="${index}">
                <img src="${draft.thumbnail || draft.imageUrl}" 
                     class="w-14 h-14 object-cover pointer-events-none" 
                     alt="Draft ${index + 1}">
            </div>
        `).join('');
        
        if (draftsContainer) draftsContainer.innerHTML = desktopHtml;
        if (draftsContainerMobile) draftsContainerMobile.innerHTML = mobileHtml;
        
        attachDraftClickHandlers();
    };

    const attachDraftClickHandlers = () => {
        const containers = [draftsContainer, draftsContainerMobile].filter(Boolean);
        containers.forEach(cont => {
            cont.querySelectorAll('.draft-item').forEach(item => {
                item.onclick = () => {
                    const draftId = parseInt(item.dataset.draftId);
                    const drafts = DraftStorage.getDrafts();
                    const draft = drafts.find(d => d.id === draftId);
                    
                    if (draft) {
                        showImageMode(draft.imageUrl, draft.filter || 'none', draft.stickers || []);
                    }
                };
            });
        });
    };

    btnCameraMode.onclick = showCameraMode;
    btnUploadMode.onclick = () => uploadInput.click();
    
    uploadInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            originalFileBlob = file;
            originalFileMimeType = file.type;
            const reader = new FileReader();
            reader.onload = (evt) => {
                showImageMode(evt.target.result);
            };
            reader.readAsDataURL(file);
        }
        uploadInput.value = '';
    };
    
    stickerInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                addCustomSticker(evt.target.result);
            };
            reader.readAsDataURL(file);
        }
        stickerInput.value = '';
    };
    
    tabFilters.onclick = () => switchTab('filters');
    tabStickers.onclick = () => switchTab('stickers');
    if (tabDraftsMobile) tabDraftsMobile.onclick = () => switchTab('drafts-mobile');
    
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => applyFilter(btn.dataset.filter);
    });
    
    attachDraftClickHandlers();
    
    captionInput.oninput = () => {
        captionCount.textContent = captionInput.value.length;
    };
    
    btnNext.onclick = async () => {
        let imageUrl;
        let rawImageUrl;
        
        if (currentMode === 'camera') {
            const rawCanvas = document.createElement('canvas');
            rawCanvas.width = cameraVideo.videoWidth;
            rawCanvas.height = cameraVideo.videoHeight;
            const rawCtx = rawCanvas.getContext('2d');
            rawCtx.drawImage(cameraVideo, 0, 0);
            rawImageUrl = rawCanvas.toDataURL('image/png');
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cameraVideo.videoWidth;
            tempCanvas.height = cameraVideo.videoHeight;
            const ctx = tempCanvas.getContext('2d');
            
            ctx.filter = currentFilter === 'none' ? 'none' : currentFilter;
            ctx.drawImage(cameraVideo, 0, 0);
            
            await bakeStickersToContext(ctx, tempCanvas.width, tempCanvas.height);
            imageUrl = tempCanvas.toDataURL('image/png');
        } else {
            compositor.render();
            rawImageUrl = compositor.export();
            
            const visualWidth = stickerLayer.offsetWidth || editorCanvas.offsetWidth || editorCanvas.width;
            const scaleMultiplier = editorCanvas.width / visualWidth;
            
            await compositor.bakeStickers(appliedStickers.map(s => ({
                type: s.type,
                imageUrl: s.imageUrl,
                x: s.x,
                y: s.y,
                scale: (s.scale || 1) * scaleMultiplier
            })));
            imageUrl = compositor.export();
        }
        
        pendingImageUrl = imageUrl;
        pendingRawImageUrl = rawImageUrl;
        sharePreviewImage.src = imageUrl;
        captionInput.value = '';
        captionCount.textContent = '0';
        shareView.classList.remove('hidden');
        shareView.classList.add('flex');
    };
    
    btnBackEditor.onclick = async () => {
        if (pendingImageUrl) {
            try {
                const generateThumbnail = async (dataUrl, maxWidth = 150, maxHeight = 150) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let { width, height } = img;
                            if (width > height) {
                                if (width > maxWidth) {
                                    height = (height * maxWidth) / width;
                                    width = maxWidth;
                                }
                            } else {
                                if (height > maxHeight) {
                                    width = (width * maxHeight) / height;
                                    height = maxHeight;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.6));
                        };
                        img.src = dataUrl;
                    });
                };
                
                const thumbnail = await generateThumbnail(pendingImageUrl);
                
                DraftStorage.saveDraft({
                    thumbnail: thumbnail,
                    imageUrl: pendingImageUrl,
                    filter: 'none',
                    stickers: []
                });
                
                refreshDrafts();
                showToast('Saved to recents', 'success');
            } catch (e) {
            }
        }
        
        shareView.classList.add('hidden');
        shareView.classList.remove('flex');
        pendingImageUrl = null;
        pendingRawImageUrl = null;
        clearStickers();
    };
    
    btnPost.onclick = async () => {
        if (!pendingImageUrl) return;
        
        btnPost.disabled = true;
        btnPost.textContent = 'Posting...';
        
        try {
            const jwtToken = getCookie('session_token');
            
            const stickersData = appliedStickers.map(s => ({
                type: s.type,
                imageUrl: s.imageUrl,
                x: s.x,
                y: s.y,
                scale: (128 * (s.scale || 1)) / (stickerLayer.offsetWidth || 500)
            }));
            
            let finalBlob;
            let fileName;
            
            if ((stickersData.length > 0 || currentFilter !== 'none') && currentMode === 'image') {
                const processFormData = new FormData();
                processFormData.append('image', pendingRawImageUrl);
                processFormData.append('filter', currentFilter);
                processFormData.append('stickers', JSON.stringify(stickersData));
                
                const processRes = await apiFetch(`${window.env.APP_URL}/process-image`, {
                    method: 'POST',
                    body: processFormData,
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'X-CSRF-TOKEN': await FetchCSRF()
                    },
                    signal: abortController.signal
                });
                
                if (processRes.ok) {
                    const processResult = await processRes.json();
                    if (processResult.image) {
                        finalBlob = await apiFetch(processResult.image).then(r => r.blob());
                        const extension = processResult.image.split(";").shift().split("/").pop() || 'png';
                        fileName = `post-${Date.now()}.${extension}`;
                    } else {
                        throw new Error('Processing failed');
                    }
                } else {
                    throw new Error('Processing failed');
                }
            } else if (originalFileBlob && currentMode === 'image') {
                finalBlob = originalFileBlob;
                const extension = originalFileMimeType.split('/')[1] || 'png';
                fileName = `post-${Date.now()}.${extension}`;
            } else {
                finalBlob = await apiFetch(pendingImageUrl).then(r => r.blob());
                const extension = pendingImageUrl.split(";").shift().split("/").pop() || 'png';
                fileName = `post-${Date.now()}.${extension}`;
            }
            
            const uploadFormData = new FormData();
            uploadFormData.append('image', finalBlob, fileName);
            uploadFormData.append('description', captionInput.value.trim());
            
            const uploadRes = await apiFetch(`${window.env.APP_URL}/upload-post`, {
                method: 'POST',
                body: uploadFormData,
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRF-TOKEN': await FetchCSRF()
                },
                signal: abortController.signal
            });
            
            if (!uploadRes.ok) {
                throw new Error('Upload failed');
            }
            
            showToast('Post shared successfully!', 'success');
            shareView.classList.add('hidden');
            shareView.classList.remove('flex');
            clearStickers();
            originalFileBlob = null;
            originalFileMimeType = null;
            goTo('/profile');
            
        } catch (e) {
            showToast('Failed to share post', 'error');
        } finally {
            btnPost.disabled = false;
            btnPost.textContent = 'Post';
        }
    };
    
    
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateStickerLayerPosition);
    });
    resizeObserver.observe(container.querySelector('#canvas-wrapper'));
    
    showCameraMode();
}
