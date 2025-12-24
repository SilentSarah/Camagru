/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

import { DraftStorage } from '../../../../utils/DraftStorage.js';

export function createRecentsView({ recents, onSelect, onClearAll, onDelete }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-full p-4';
    
    const drafts = DraftStorage.getDrafts ? DraftStorage.getDrafts() : [];
    const allRecents = [...recents, ...drafts];

    const render = () => {
        // Simple re-render logic or just render once? 
        // For now, we render static HTML. If state changes (delete), the controller might re-render the whole view or we handle it here.
        // Let's assume re-rendering the whole view is cheap enough or we manipulate DOM.
        
        container.innerHTML = `
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
        `;

        const clearAllBtn = container.querySelector('#clear-all-recents');
        if (clearAllBtn) {
            clearAllBtn.onclick = onClearAll;
        }

        container.querySelectorAll('.delete-recent').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const id = btn.dataset.id;
                onDelete(index, id);
            };
        });

        container.querySelectorAll('.recent-item').forEach(item => {
            item.onclick = () => {
                const index = parseInt(item.dataset.index);
                const recent = allRecents[index];
                if (recent && onSelect) {
                    onSelect(recent);
                }
            };
        });
    };

    render();

    return container;
}
