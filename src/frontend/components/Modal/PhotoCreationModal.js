/*
 * File Created: Tuesday, 16th December 2025
 * Author: Camagru Team
 */

import Modal from './Modal.js';
import { PhotoCompositor } from '../../utils/PhotoCompositor.js';
import { DraftStorage } from '../../utils/DraftStorage.js';
import { showToast } from '../Toast.js';

// In-memory recents array (cleared on page refresh)
const recents = [];

// --- Constants ---

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

const STICKERS = [
    { id: 'sunglasses', emoji: '😎', name: 'Sunglasses' },
    { id: 'heart-eyes', emoji: '😍', name: 'Heart Eyes' },
    { id: 'star', emoji: '⭐', name: 'Star' },
    { id: 'fire', emoji: '🔥', name: 'Fire' },
    { id: 'heart', emoji: '❤️', name: 'Heart' },
    { id: 'sparkles', emoji: '✨', name: 'Sparkles' },
    { id: 'crown', emoji: '👑', name: 'Crown' },
    { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
    { id: 'party', emoji: '🎉', name: 'Party' },
    { id: 'cool', emoji: '🆒', name: 'Cool' },
];

export default function PhotoCreationModal({ onClose, onPost }) {
    let mode = 'selection';
    let compositor = null;
    let mediaStream = null;
    let stickers = []; // Array of active DOM sticker objects
    let currentFile = null; // Track the original file for GIF processing
    let isGif = false; // Track if current image is a GIF
    
    // Track last edit state for back navigation
    let lastEditState = {
        imageUrl: null,
        filter: 'none',
        stickers: []
    };
    
    // --- Styles for Sticker Overlay ---
    const style = document.createElement('style');
    style.innerHTML = `
        .sticker-overlay {
            position: absolute;
            user-select: none;
            touch-action: none;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            transform-origin: center center;
            /* Border applied to this wrapper will now scale if we transform this wrapper */
        }
        .sticker-overlay:active {
            cursor: grabbing;
            /* Use box-shadow which follows transforms better than outline in some engines */
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        .sticker-overlay .controls {
            display: none; 
            /* Inverse scale icons to keep them constant size? complicated, let's keep simple first */
        }
        .sticker-overlay:hover .controls, .sticker-overlay:active .controls {
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
        #sticker-layer {
            /* Ensure it strictly matches canvas size */
            touch-action: none;
            overflow: hidden; 
        }
    `;
    document.head.appendChild(style);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'bg-insta rounded-xl flex flex-col overflow-hidden text-neutral-100 shadow-2xl transition-all duration-300';
    contentContainer.style.width = 'min(90vw, 500px)';
    contentContainer.style.height = 'min(80vh, 550px)';
    
    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between h-[44px] px-4 border-b border-neutral-800 shrink-0';
    header.innerHTML = `
        <button id="modal-back-btn" class="text-neutral-100 hover:opacity-70 transition-opacity hidden">
            <i class="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <button id="modal-cancel-btn" class="text-neutral-100 text-2xl hover:opacity-70 transition-opacity leading-none">
            &times;
        </button>
        <h2 id="modal-title" class="font-semibold text-base flex-1 text-center">Create new post</h2>
        <button id="modal-next-btn" class="text-blue-500 font-semibold text-sm hover:text-white transition-colors hidden">
            Next
        </button>
    `;
    contentContainer.appendChild(header);

    // Cancel Button Handler
    header.querySelector('#modal-cancel-btn').onclick = () => {
        // Just verify if user wants to discard? For now just close.
        if (mode === 'edit') {
            if (confirm('Discard changes?')) {
                 modal.close();
            }
        } else {
             modal.close();
        }
    };

    const main = document.createElement('div');
    main.className = 'flex-1 relative overflow-hidden bg-neutral-900 flex flex-col';
    contentContainer.appendChild(main);

    const modal = Modal({
        isOpen: true,
        onClose: () => {
             stopCamera();
             style.remove();
             if (onClose) onClose();
        },
        children: contentContainer,
        className: 'p-0 bg-transparent shadow-none border-0',
        hideCloseButton: true
    });
    
    // Bind close method to modal object for internal usage
    modal.close = () => {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.click(); // Trigger generic close
    };

    // --- Views ---

    const renderSelectionView = () => {
        mode = 'selection';
        updateHeader('Create new post', false, false);
        contentContainer.style.width = 'min(90vw, 500px)';
        contentContainer.style.height = 'min(80vh, 550px)';
        
        main.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full gap-4 p-8">
                <div class="mb-4 text-gray-400"> 
                    
                    <svg width="135" height="100" viewBox="0 0 135 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="54.8383" y="19.8381" width="79" height="79" rx="14.5" stroke="white"/>
                        <path d="M111.588 55.4407C114.588 57.1727 114.588 61.5035 111.588 63.2356L89.0883 76.2258C86.0883 77.9578 82.3383 75.7924 82.3383 72.3284V46.3479C82.3383 42.8838 86.0883 40.7185 89.0883 42.4504L111.588 55.4407Z" stroke="white"/>
                        <path d="M81.8383 19.338L81.1666 15.0843C79.858 6.79754 72.0074 1.195 63.7454 2.65181L14.7721 11.2871C6.6137 12.7257 1.16617 20.5055 2.60472 28.664L11.2798 77.8627C12.7212 86.0374 20.5276 91.4871 28.6982 90.0227L54.8383 85.3377" stroke="white"/>
                        <line x1="10.6839" y1="70.5035" x2="22.5611" y2="57.2395" stroke="white"/>
                        <line x1="22.2033" y1="57.3163" x2="38.0744" y2="66.703" stroke="white"/>
                        <line x1="37.4973" y1="66.7513" x2="55.0156" y2="51.9557" stroke="white"/>
                        <circle cx="20.273" cy="28.0871" r="7" transform="rotate(-10 20.273 28.0871)" stroke="white"/>
                    </svg>

                </div>
                <h3 class="text-xl font-light">Drag photos and GIFs here</h3>
                
                <div class="flex gap-3 mt-4">
                     <button id="btn-upload" class="bg-[#0095f6] hover:bg-[#1877f2] font-semibold px-4 py-1.5 rounded-md text-sm text-white transition-colors">
                        <i class="fa-solid fa-upload mr-1"></i> Upload
                     </button>
                      <button id="btn-camera" class="bg-gray-800 hover:bg-gray-700 font-semibold px-4 py-1.5 rounded-md text-sm text-white transition-colors">
                        <i class="fa-solid fa-camera mr-1"></i> Camera
                     </button>
                      <button id="btn-recents" class="bg-gray-800 hover:bg-gray-700 font-semibold px-4 py-1.5 rounded-md text-sm text-white transition-colors">
                        <i class="fa-solid fa-clock-rotate-left mr-1"></i> Recents
                     </button>
                </div>
                
                <input type="file" id="file-input" class="hidden" accept="image/*">
                
                ${recents.length > 0 ? `
                    <div class="w-full mt-6 pt-6 border-t border-neutral-800">
                        <h4 class="text-neutral-400 font-semibold mb-3 text-xs uppercase tracking-wide text-center">Recent Edits</h4>
                        <div class="grid grid-cols-4 gap-2" id="recents-grid">
                            ${recents.map((r, i) => `
                                <div class="recent-item cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all aspect-square" data-index="${i}">
                                    <img src="${r.thumbnail}" class="w-full h-full object-cover">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        main.querySelector('#btn-upload').onclick = () => main.querySelector('#file-input').click();
        main.querySelector('#btn-camera').onclick = renderCameraView;
        main.querySelector('#btn-recents').onclick = renderRecentsView;
        main.querySelector('#file-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) validateAndSelectFile(file);
        };
        
        main.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            main.classList.add('bg-gray-800');
        };
        main.ondragleave = (e) => {
            e.preventDefault();
            main.classList.remove('bg-gray-800');
        };
        main.ondrop = (e) => {
            e.preventDefault();
            main.classList.remove('bg-gray-800');
            const file = e.dataTransfer.files[0];
            if (file) {
                validateAndSelectFile(file);
            }
        };

        // Click handler for recent items (if any in the initial view)
        main.querySelectorAll('.recent-item').forEach(item => {
            item.onclick = () => {
                const index = parseInt(item.dataset.index);
                const recent = recents[index];
                if (recent) {
                    renderEditorView(recent.imageUrl, recent.filter, recent.stickers);
                }
            };
        });
    };

    const renderRecentsView = () => {
        mode = 'recents';
        updateHeader('Recent Edits', true, false);
        
        const drafts = DraftStorage.getDrafts ? DraftStorage.getDrafts() : [];
        const allRecents = [...recents, ...drafts];
        
        main.innerHTML = `
            <div class="flex flex-col h-full p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Your Recent Edits</h3>
                    ${allRecents.length > 0 ? `
                        <button id="clear-all-recents" class="text-sm text-red-400 hover:text-red-300 transition-colors">
                            <i class="fa-solid fa-trash-can mr-1"></i> Clear All
                        </button>
                    ` : ''}
                </div>
                ${allRecents.length === 0 ? `
                    <div class="flex-1 flex items-center justify-center text-gray-500">
                        <p>No recent edits yet. Take a photo or upload one to get started!</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-3 gap-3 overflow-y-auto flex-1">
                        ${allRecents.map((r, i) => `
                            <div class="recent-item-wrapper relative group">
                                <div class="recent-item cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all aspect-square" data-index="${i}" data-id="${r.id || ''}">
                                    <img src="${r.thumbnail || r.imageUrl}" class="w-full h-full object-cover">
                                </div>
                                <button class="delete-recent absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" data-index="${i}" data-id="${r.id || ''}">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;

        // Clear All button handler
        const clearAllBtn = main.querySelector('#clear-all-recents');
        if (clearAllBtn) {
            clearAllBtn.onclick = () => {
                // Clear in-memory recents
                recents.length = 0;
                // Clear localStorage drafts
                DraftStorage.clearDrafts();
                // Re-render the view
                renderRecentsView();
            };
        }

        // Delete individual recent handler
        main.querySelectorAll('.delete-recent').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const id = btn.dataset.id;
                
                // Check if it's from in-memory recents or localStorage
                if (index < recents.length) {
                    // Remove from in-memory recents
                    recents.splice(index, 1);
                } else if (id) {
                    // Remove from localStorage
                    DraftStorage.deleteDraft(parseInt(id));
                }
                // Re-render the view
                renderRecentsView();
            };
        });

        // Click handler for recent items
        main.querySelectorAll('.recent-item').forEach(item => {
            item.onclick = () => {
                const index = parseInt(item.dataset.index);
                const recent = allRecents[index];
                if (recent) {
                    // Pass the draft ID to track that this came from recents
                    renderEditorView(recent.imageUrl, recent.filter, recent.stickers || [], recent.id);
                }
            };
        });
    };

    const renderCameraView = async () => {
        mode = 'camera';
        updateHeader('Photo', true, false);
        
        main.innerHTML = `
            <div class="relative w-full h-full bg-black flex items-center justify-center">
                <video id="camera-video" class="w-full h-full object-cover transform scale-x-[-1]" autoplay playsinline muted></video>
                <canvas id="camera-canvas" class="hidden"></canvas>
                <button id="capture-btn" class="absolute bottom-8 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform bg-white/20 backdrop-blur-sm">
                    <div class="w-12 h-12 bg-white rounded-full"></div>
                </button>
            </div>
        `;

        const video = main.querySelector('#camera-video');
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            video.srcObject = mediaStream;
        } catch (e) {
            showToast('Camera access failed', 'error');
            renderSelectionView();
        }

        main.querySelector('#capture-btn').onclick = () => {
             const canvas = main.querySelector('#camera-canvas');
             canvas.width = video.videoWidth;
             canvas.height = video.videoHeight;
             const ctx = canvas.getContext('2d');
             ctx.translate(canvas.width, 0);
             ctx.scale(-1, 1);
             ctx.drawImage(video, 0, 0);
             
             const dataUrl = canvas.toDataURL('image/png');
             stopCamera();
             renderEditorView(dataUrl);
        };
    };

    const renderEditorView = (imageUrl, initialFilter = 'none', initialStickers = [], fromDraftId = null) => {
        mode = 'edit';
        updateHeader('Crops', true, true, 'Next');
        
        // Track if editor state has been modified from the original
        let hasBeenModified = false;
        
        contentContainer.style.width = 'min(95vw, 1100px)';
        contentContainer.style.height = 'min(90vh, 800px)';

        main.innerHTML = /* html */`
            <div class="flex flex-col lg:flex-row h-full">
                <!-- Canvas Area -->
                <div class="flex-1 bg-[#1c1e21] flex items-center justify-center overflow-hidden" id="canvas-wrapper">
                    <div class="relative inline-block max-w-full max-h-full" id="canvas-container">
                        <canvas id="editor-canvas" class="block max-w-full max-h-full"></canvas>
                        <div id="sticker-layer" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="w-full lg:w-[340px] bg-insta border-l border-neutral-800 flex flex-col z-10">
                    <div class="flex border-b border-neutral-800">
                        <button class="flex-1 py-4 text-sm font-semibold text-white border-b-2 border-white transition-colors" id="tab-filters">Filters</button>
                        <button class="flex-1 py-4 text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors" id="tab-stickers">Stickers</button>
                    </div>

                    <div id="panel-filters" class="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-3 gap-4 content-start">
                        ${FILTERS.map(f => `
                            <div class="filter-btn flex flex-col items-center gap-2 cursor-pointer group" data-filter="${f.css}" data-id="${f.id}">
                                <div class="w-20 h-20 rounded-md bg-gray-700 overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all ${f.css === initialFilter ? 'border-blue-500' : ''}">
                                    <img src="${imageUrl}" class="w-full h-full object-cover transition-transform group-hover:scale-110" style="filter: ${f.css}">
                                </div>
                                <span class="text-xs text-gray-400 group-hover:text-white ${f.css === initialFilter ? 'text-blue-500' : ''}">${f.name}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div id="panel-stickers" class="flex-1 hidden overflow-y-auto p-4 custom-scrollbar">
                         <div class="mb-4">
                             <h4 class="text-neutral-400 font-semibold mb-2 text-xs uppercase tracking-wide">Custom</h4>
                             <label class="w-16 h-16 flex items-center justify-center border border-gray-600 rounded-lg hover:bg-gray-800 cursor-pointer bg-gray-800/30">
                                <i class="fa-solid fa-plus text-xl text-gray-400"></i>
                                <input type="file" id="custom-sticker-input" class="hidden" accept="image/png,image/jpeg">
                             </label>
                         </div>
                         
                         <h4 class="text-neutral-400 font-semibold mb-2 text-xs uppercase tracking-wide">Emojis</h4>
                         <div class="grid grid-cols-4 gap-4">
                            ${STICKERS.map(s => `
                                <button class="sticker-btn text-3xl hover:scale-125 transition-transform p-3 bg-gray-800/30 rounded-lg flex items-center justify-center aspect-square" data-emoji="${s.emoji}">
                                    ${s.emoji}
                                </button>
                            `).join('')}
                         </div>
                    </div>
                </div>
            </div>
        `;

        const canvas = main.querySelector('#editor-canvas');
        const stickerLayer = main.querySelector('#sticker-layer');
        compositor = new PhotoCompositor(canvas);
        
        // Sticker layer is now aligned via CSS (inset-0 on the container)
        // No JavaScript positioning needed

        compositor.loadImage(imageUrl).then(() => {
            compositor.setFilter(initialFilter);
            stickerLayer.style.filter = compositor.filter;
            stickers = [];
            initialStickers.forEach(s => addStickerToDom(s));
        });

        // Cleanup is handled by the modal's onClose callback

        // --- Tabs ---
        const tabFilters = main.querySelector('#tab-filters');
        const tabStickers = main.querySelector('#tab-stickers');
        const panelFilters = main.querySelector('#panel-filters');
        const panelStickers = main.querySelector('#panel-stickers');

        const switchTab = (tab) => {
             if (tab === 'filters') {
                tabFilters.className = 'flex-1 py-4 text-sm font-semibold text-white border-b-2 border-white';
                tabStickers.className = 'flex-1 py-4 text-sm font-semibold text-gray-400 hover:text-gray-200';
                panelFilters.classList.remove('hidden');
                panelFilters.classList.add('grid');
                panelStickers.classList.add('hidden');
             } else {
                tabStickers.className = 'flex-1 py-4 text-sm font-semibold text-white border-b-2 border-white';
                tabFilters.className = 'flex-1 py-4 text-sm font-semibold text-gray-400 hover:text-gray-200';
                panelStickers.classList.remove('hidden');
                panelFilters.classList.add('hidden');
                panelFilters.classList.remove('grid');
             }
        };

        tabFilters.onclick = () => switchTab('filters');
        tabStickers.onclick = () => switchTab('stickers');

        // Apply Filter
        main.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => {
                const filter = btn.dataset.filter;
                compositor.setFilter(filter);
                stickerLayer.style.filter = filter; // Apply to stickers too!
                hasBeenModified = true; // Mark as modified
                
                main.querySelectorAll('.filter-btn div').forEach(d => d.classList.remove('border-blue-500'));
                main.querySelectorAll('.filter-btn span').forEach(s => s.classList.remove('text-blue-500'));
                btn.querySelector('div').classList.add('border-blue-500');
                btn.querySelector('span').classList.add('text-blue-500');
            };
        });

        main.querySelectorAll('.sticker-btn').forEach(btn => {
            btn.onclick = () => {
                addStickerToDom({ emoji: btn.dataset.emoji });
                hasBeenModified = true; // Mark as modified
            };
        });

        main.querySelector('#custom-sticker-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                 const reader = new FileReader();
                 reader.onload = (evt) => {
                     addStickerToDom({ type: 'image', imageUrl: evt.target.result });
                     hasBeenModified = true; // Mark as modified
                 };
                 reader.readAsDataURL(file);
            }
        };

        const addStickerToDom = (data) => {
            const id = Date.now() + Math.random();
            const el = document.createElement('div');
            el.className = 'sticker-overlay pointer-events-auto';
            el.style.left = '50%';
            el.style.top = '50%';
            
            let contentHml = '';
            if (data.type === 'image') {
                contentHml = `<img src="${data.imageUrl}" class="w-32 shrink-0 pointer-events-none">`;
            } else {
                contentHml = `<span class="text-6xl cursor-default select-none">${data.emoji}</span>`;
            }

            el.innerHTML = `
                ${contentHml}
                <div class="controls">
                    <div class="sticker-delete"><i class="fa-solid fa-xmark"></i></div>
                    <div class="sticker-resize"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></div>
                </div>
            `;
            
            stickerLayer.appendChild(el);

            if (data.scale) {
                el.style.transform = `translate(-50%, -50%) scale(${data.scale})`;
            } else {
                el.style.transform = `translate(-50%, -50%) scale(1)`;
            }
            
            if (data.x !== undefined && data.y !== undefined) {
                el.style.left = `${data.x * 100}%`;
                el.style.top = `${data.y * 100}%`;
            }

            const stickerObj = { id, element: el, ...data, x: data.x || 0.5, y: data.y || 0.5, scale: data.scale || 1 };
            stickers.push(stickerObj);

            // Helpers
            const updateTransform = () => {
                el.style.transform = `translate(-50%, -50%) scale(${stickerObj.scale})`;
            };

            // Draggable (Delta Based)
            let isDragging = false;
            let startMouseX, startMouseY;
            let startObjX, startObjY;
            
            el.onmousedown = (e) => {
                if(e.target.closest('.sticker-resize') || e.target.closest('.sticker-delete')) return;
                isDragging = true;
                
                startMouseX = e.clientX;
                startMouseY = e.clientY;
                startObjX = stickerObj.x;
                startObjY = stickerObj.y;
                
                el.style.cursor = 'grabbing';
            };

            const resizeHandle = el.querySelector('.sticker-resize');
            resizeHandle.onmousedown = (e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startScale = stickerObj.scale;
                
                const onMove = (mv) => {
                     const diff = mv.clientX - startX;
                     const newScale = Math.max(0.3, startScale + (diff / 100));
                     stickerObj.scale = newScale;
                     updateTransform();
                };
                
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            };

            el.querySelector('.sticker-delete').onclick = (e) => {
                e.stopPropagation();
                el.remove();
                stickers = stickers.filter(s => s.id !== id);
                hasBeenModified = true; // Mark as modified
            };

            const onGlobalMove = (e) => {
                if (!isDragging) return;
                
                const layerRect = stickerLayer.getBoundingClientRect();
                if (layerRect.width === 0 || layerRect.height === 0) return;

                const deltaX = e.clientX - startMouseX;
                const deltaY = e.clientY - startMouseY;

                // Convert delta pixels to percentage
                let newX = startObjX + (deltaX / layerRect.width);
                let newY = startObjY + (deltaY / layerRect.height);
                
                // Clamp to bounds (0-1)
                newX = Math.max(0, Math.min(1, newX));
                newY = Math.max(0, Math.min(1, newY));

                el.style.left = `${newX * 100}%`;
                el.style.top = `${newY * 100}%`;
                
                // Enforce transform purely based on state, ignoring drag
                el.style.transform = `translate(-50%, -50%) scale-[${stickerObj.scale || 1}]`;
                
                stickerObj.x = newX;
                stickerObj.y = newY;
            };

            const onGlobalUp = () => {
                if (isDragging) {
                    isDragging = false;
                    el.style.cursor = 'grab';
                }
            };

            document.addEventListener('mousemove', onGlobalMove);
            document.addEventListener('mouseup', onGlobalUp);
        };

        header.querySelector('#modal-next-btn').onclick = async () => {
             // Save current state for back navigation BEFORE baking
             lastEditState = {
                 imageUrl: imageUrl,
                 filter: compositor.filter,
                 stickers: stickers.map(s => ({...s, element: undefined}))
             };
             
             // Process image via backend (handles both static images and GIFs)
             const finalImage = await processImageWithStickers(
                 currentFile,
                 stickers.map(s => ({...s, element: undefined})),
                 compositor.filter
             );
             
             // Only save to drafts if this is a new image or has been modified
             // Skip if it came from recents and hasn't been modified
             if (!fromDraftId || hasBeenModified) {
                 // If it came from a draft and was modified, delete the old one first
                 if (fromDraftId && hasBeenModified) {
                     DraftStorage.deleteDraft(fromDraftId);
                 }
                 
                 // Save the baked/final image as thumbnail, not the original
                 DraftStorage.saveDraft({
                    thumbnail: finalImage,
                    imageUrl: imageUrl, 
                    filter: compositor.filter,
                    stickers: stickers.map(s => ({...s, element: undefined}))
                 });
             }

             renderShareView(finalImage);
        };
    };

    const renderShareView = (imageDataUrl) => {
        mode = 'share';
        updateHeader('Create new post', true, true, 'Share');
        contentContainer.style.width = 'min(95vw, 1100px)';
        contentContainer.style.height = 'min(90vh, 800px)';

        main.innerHTML = `
            <div class="flex flex-col lg:flex-row h-full">
                <!-- Preview (Left) -->
                <div class="w-full lg:w-[65%] bg-black flex items-center justify-center">
                    <img src="${imageDataUrl}" class="max-w-full max-h-full object-contain">
                </div>

                <!-- Details (Right) -->
                <div class="w-full lg:w-[35%] bg-insta border-l border-neutral-800 p-4 flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                         <div class="w-8 h-8 rounded-full bg-gray-700"></div> 
                         <span class="font-semibold text-sm">You</span>
                    </div>

                    <textarea id="caption-input" class="w-full h-40 bg-transparent text-white resize-none outline-none text-sm placeholder-gray-500" placeholder="Write a caption..."></textarea>
                    
                    <div class="border-t border-gray-800 pt-4 cursor-pointer flex justify-between group">
                        <span class="text-sm">Add Location</span>
                        <i class="fa-solid fa-location-dot text-gray-400 group-hover:text-white"></i>
                    </div>
                </div>
            </div>
        `;

         header.querySelector('#modal-next-btn').onclick = async () => {
            const btn = header.querySelector('#modal-next-btn');
            const caption = main.querySelector('#caption-input').value;
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                 const blob = await fetch(imageDataUrl).then(r => r.blob());
                const formData = new FormData();
                formData.append('image', blob, 'post.png');
                formData.append('description', caption);

                await new Promise(r => setTimeout(r, 1000));
                
                if (onPost) onPost({ imageUrl: imageDataUrl, description: caption });
                modal.close();
                showToast('Post shared', 'success');
            } catch (e) {
                 showToast('Upload failed', 'error');
                 btn.textContent = 'Share';
                 btn.disabled = false;
            }
         };
    };

    const updateHeader = (title, showBack, showNext, nextLabel = 'Next') => {
        header.querySelector('#modal-title').textContent = title;
        
        // Cancel/Close button is always there (top right in modal, but we put it left in header as 'X' or hidden?)
        // Design: "Back" arrow (left), Title (center), Next (right). 
        // If "Back" is hidden, show "X" (Cancel) on right? Or left?
        // Instagram: Top right is Next. Top Left is Back.
        // If selection mode: Top right is empty, Top left is empty?? No, usually "X" to close.
        
        const backBtn = header.querySelector('#modal-back-btn');
        const cancelBtn = header.querySelector('#modal-cancel-btn');
        
        if (showBack) {
            backBtn.classList.remove('hidden');
            cancelBtn.classList.add('hidden');
            backBtn.onclick = () => {
                if (mode === 'camera' || mode === 'edit' || mode === 'recents') renderSelectionView();
                else if (mode === 'share') {
                    // Restore the last edit state with filter and stickers
                    renderEditorView(
                        lastEditState.imageUrl,
                        lastEditState.filter,
                        lastEditState.stickers
                    );
                }
            };
        } else {
            backBtn.classList.add('hidden');
            cancelBtn.classList.remove('hidden'); // Show X if no back
        }

        const nextBtn = header.querySelector('#modal-next-btn');
        if (showNext) {
            nextBtn.classList.remove('hidden');
            nextBtn.textContent = nextLabel;
        } else {
            nextBtn.classList.add('hidden');
        }
    };

    /**
     * Validate file type and show error if invalid
     */
    const validateAndSelectFile = (file) => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        // Reject SVG files
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
            showToast('SVG files are not supported. Please use PNG, JPG, or GIF', 'error');
            return;
        }
        
        handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        currentFile = file;
        isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
        
        const reader = new FileReader();
        reader.onload = (e) => renderEditorView(e.target.result);
        reader.readAsDataURL(file);
    };

    /**
     * Process image with stickers/filters via backend PHP GD
     * Backend handles both static images (PNG, JPG) and animated GIFs
     * @param {File} imageFile - The original image file
     * @param {Array} stickerData - Array of sticker objects with positions/scales
     * @param {string} filterCss - CSS filter string to apply
     * @returns {Promise<string>} - URL of processed image
     */
    const processImageWithStickers = async (imageFile, stickerData, filterCss) => {
        const formData = new FormData();
        
        // Add the image file (backend will detect if it's a GIF or static image)
        formData.append('image', imageFile);
        
        // Add filter data
        formData.append('filter', filterCss);
        
        // Prepare sticker data for backend
        // Each sticker needs: type, emoji/imageUrl, x, y, scale
        const stickersForBackend = stickerData.map(s => ({
            type: s.type || 'emoji',
            emoji: s.emoji || null,
            imageUrl: s.imageUrl || null,
            x: s.x,           // Relative position (0-1)
            y: s.y,           // Relative position (0-1)
            scale: s.scale || 1
        }));
        formData.append('stickers', JSON.stringify(stickersForBackend));
        
        // Add canvas dimensions for scale reference
        formData.append('canvasWidth', compositor.canvas.width.toString());
        formData.append('canvasHeight', compositor.canvas.height.toString());
        
        try {
            const response = await fetch('http://localhost:8000/process-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Image processing failed');
            }
            
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Image processing error:', error);
            showToast('Failed to process image', 'error');
            
            // Fallback to canvas baking for static images
            await compositor.bakeStickers(stickerData);
            return compositor.export();
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    };

    renderSelectionView();

    return modal;
}

export function openPhotoCreationModal(options) {
    const modal = PhotoCreationModal(options);
    document.body.appendChild(modal);
    return modal;
}
