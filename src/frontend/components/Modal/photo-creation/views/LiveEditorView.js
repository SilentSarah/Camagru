/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 * 
 * LiveEditorView - Combined camera/image editor with real-time preview
 */

import { PhotoCompositor } from '../../../../utils/PhotoCompositor.js';
import { StickerManager } from '../logic/StickerManager.js';
import { showToast } from '../../../Toast.js';

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

export function createLiveEditorView({ mode = 'camera', imageUrl = null, initialFilter = 'none', initialStickers = [], onCapture, onStateChange, onError }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col lg:flex-row h-full';
    
    const isCamera = mode === 'camera';
    
    container.innerHTML = `
        <!-- Preview Area -->
        <div class="flex-1 bg-[#1c1e21] flex items-center justify-center overflow-hidden relative" id="preview-wrapper">
            ${isCamera ? `
                <video id="camera-video" class="w-full h-full object-contain transform scale-x-[-1]" autoplay playsinline muted></video>
            ` : `
                <div class="relative w-full h-full flex items-center justify-center" id="canvas-container">
                    <canvas id="editor-canvas" class="block max-w-full max-h-full"></canvas>
                </div>
            `}
            <div id="sticker-layer" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
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
                            ${imageUrl ? 
                                `<img src="${imageUrl}" class="w-full h-full object-cover transition-transform group-hover:scale-110" style="filter: ${f.css}">` 
                                : 
                                `<div class="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-2xl" style="filter: ${f.css}">📷</div>`
                            }
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
            </div>

            <!-- Capture/Next Button -->
            <div class="p-4 border-t border-neutral-800">
                <button id="capture-btn" class="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors">
                    ${isCamera ? 'Capture' : 'Next'}
                </button>
            </div>
        </div>
    `;

    let currentFilter = initialFilter;
    let mediaStream = null;
    const stickerLayer = container.querySelector('#sticker-layer');
    
    // Sticker manager
    const stickerManager = new StickerManager(stickerLayer, () => {
        if (onStateChange) {
            onStateChange({
                filter: currentFilter,
                stickers: stickerManager.getData()
            });
        }
    });

    // Load initial stickers
    if (initialStickers && initialStickers.length > 0) {
        stickerManager.load(initialStickers);
    }

    // --- Camera Mode ---
    if (isCamera) {
        const video = container.querySelector('#camera-video');
        
        const startCamera = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
                    audio: false 
                });
                video.srcObject = mediaStream;
            } catch (e) {
                if (onError) onError(e);
                else showToast('Camera access failed', 'error');
            }
        };
        
        startCamera();
        
        // Apply filter to video
        video.style.filter = currentFilter === 'none' ? '' : currentFilter;
        stickerLayer.style.filter = currentFilter === 'none' ? '' : currentFilter;
        
        // Capture button
        container.querySelector('#capture-btn').onclick = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Apply filter
            ctx.filter = currentFilter === 'none' ? 'none' : currentFilter;
            
            // Mirror and draw
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Bake stickers
            const stickers = stickerManager.getData();
            ctx.filter = currentFilter === 'none' ? 'none' : currentFilter;
            
            for (const sticker of stickers) {
                const x = sticker.x * canvas.width;
                const y = sticker.y * canvas.height;
                const scale = sticker.scale || 1;
                
                ctx.save();
                ctx.translate(x, y);
                
                if (sticker.type === 'image' && sticker.imageUrl) {
                    await new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            const baseWidth = 128 * scale;
                            const aspectRatio = img.naturalHeight / img.naturalWidth;
                            const width = baseWidth;
                            const height = baseWidth * aspectRatio;
                            ctx.drawImage(img, -width/2, -height/2, width, height);
                            resolve();
                        };
                        img.onerror = resolve;
                        img.src = sticker.imageUrl;
                    });
                } else if (sticker.emoji) {
                    const fontSize = 60 * scale;
                    ctx.font = `${fontSize}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(sticker.emoji, 0, 0);
                }
                
                ctx.restore();
            }
            
            const dataUrl = canvas.toDataURL('image/png');
            
            if (onCapture) {
                onCapture(dataUrl, {
                    filter: currentFilter,
                    stickers: stickers
                });
            }
        };
    } 
    // --- Image Mode ---
    else {
        const canvas = container.querySelector('#editor-canvas');
        const compositor = new PhotoCompositor(canvas);
        
        compositor.loadImage(imageUrl).then(() => {
            compositor.setFilter(initialFilter);
            
            // Update sticker layer dimensions
            const updateStickerLayer = () => {
                const canvasRect = canvas.getBoundingClientRect();
                const wrapperRect = container.querySelector('#preview-wrapper').getBoundingClientRect();
                
                stickerLayer.style.left = `${canvasRect.left - wrapperRect.left}px`;
                stickerLayer.style.top = `${canvasRect.top - wrapperRect.top}px`;
                stickerLayer.style.width = `${canvasRect.width}px`;
                stickerLayer.style.height = `${canvasRect.height}px`;
            };
            
            updateStickerLayer();
            new ResizeObserver(updateStickerLayer).observe(canvas);
            
            if (onStateChange) {
                onStateChange({
                    filter: currentFilter,
                    stickers: stickerManager.getData(),
                    compositor
                });
            }
        });
        
        // Next button - bake and proceed
        container.querySelector('#capture-btn').onclick = async () => {
            await compositor.bakeStickers(stickerManager.getData());
            const dataUrl = compositor.export();
            
            if (onCapture) {
                onCapture(dataUrl, {
                    filter: currentFilter,
                    stickers: stickerManager.getData()
                });
            }
        };
    }

    // --- Tab Logic ---
    const tabFilters = container.querySelector('#tab-filters');
    const tabStickers = container.querySelector('#tab-stickers');
    const panelFilters = container.querySelector('#panel-filters');
    const panelStickers = container.querySelector('#panel-stickers');

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

    // --- Filter Logic ---
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            const filter = btn.dataset.filter;
            currentFilter = filter;
            
            // Apply to preview
            if (isCamera) {
                const video = container.querySelector('#camera-video');
                video.style.filter = filter === 'none' ? '' : filter;
            } else {
                const canvas = container.querySelector('#editor-canvas');
                const compositor = new PhotoCompositor(canvas);
                compositor.setFilter(filter);
            }
            
            stickerLayer.style.filter = filter === 'none' ? '' : filter;
            
            // UI Update
            container.querySelectorAll('.filter-btn div').forEach(d => d.classList.remove('border-blue-500'));
            container.querySelectorAll('.filter-btn span').forEach(s => s.classList.remove('text-blue-500'));
            btn.querySelector('div').classList.add('border-blue-500');
            btn.querySelector('span').classList.add('text-blue-500');
            
            if (onStateChange) {
                onStateChange({
                    filter: currentFilter,
                    stickers: stickerManager.getData()
                });
            }
        };
    });

    // --- Sticker Upload ---
    container.querySelector('#custom-sticker-input').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                stickerManager.add({ type: 'image', imageUrl: evt.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Stop Camera ---
    container.stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    };

    return container;
}
