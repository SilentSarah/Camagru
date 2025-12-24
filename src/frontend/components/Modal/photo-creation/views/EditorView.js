/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

import { PhotoCompositor } from '../../../../utils/PhotoCompositor.js';
import { StickerManager } from '../logic/StickerManager.js';

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



export function createEditorView({ imageUrl, initialFilter = 'none', initialStickers = [], onStateChange }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col lg:flex-row h-full';
    
    container.innerHTML = `
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
            </div>
        </div>
    `;

    // Initialize System
    const canvas = container.querySelector('#editor-canvas');
    const stickerLayer = container.querySelector('#sticker-layer');
    const compositor = new PhotoCompositor(canvas);
    
    // Notify state changes
    const notifyChange = () => {
        if (onStateChange) {
            onStateChange({
                filter: compositor.filter,
                stickers: stickerManager.getData(),
                compositor: compositor // expose compositor for export
            });
        }
    };

    const stickerManager = new StickerManager(stickerLayer, notifyChange);

    // Initial Load
    compositor.loadImage(imageUrl).then(() => {
        compositor.setFilter(initialFilter);
        stickerLayer.style.filter = initialFilter;
        if (initialStickers) {
            stickerManager.load(initialStickers);
        }
        notifyChange(); // Initial state
    });

    // --- Tabs Logic ---
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
            compositor.setFilter(filter);
            stickerLayer.style.filter = filter;
            
            // UI Update
            container.querySelectorAll('.filter-btn div').forEach(d => d.classList.remove('border-blue-500'));
            container.querySelectorAll('.filter-btn span').forEach(s => s.classList.remove('text-blue-500'));
            btn.querySelector('div').classList.add('border-blue-500');
            btn.querySelector('span').classList.add('text-blue-500');
            
            notifyChange();
        };
    });

    // --- Sticker Logic ---


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

    // Public API
    container.getCompositor = () => compositor;
    container.getStickers = () => stickerManager.getData();
    // Force method to bake stickers if needed by parent, assuming functionality was on compositor:
    container.bakeStickers = async () => {
         await compositor.bakeStickers(stickerManager.getData());
    };

    return container;
}
