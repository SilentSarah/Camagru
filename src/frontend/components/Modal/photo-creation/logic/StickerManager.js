/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

export class StickerManager {
    constructor(layerElement, onModify) {
        this.layer = layerElement;
        this.onModify = onModify;
        this.stickers = [];
    }

    add(data) {
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
        
        this.layer.appendChild(el);

        // Initial Transform
        const scale = data.scale || 1;
        if (data.x !== undefined && data.y !== undefined) {
            el.style.left = `${data.x * 100}%`;
            el.style.top = `${data.y * 100}%`;
        }
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;

        const stickerObj = { 
            id: data.id || id,
            ...data,
            element: el,
            x: data.x || 0.5, 
            y: data.y || 0.5, 
            scale: scale 
        };
        this.stickers.push(stickerObj);

        this._setupInteractions(stickerObj);
        
        if (this.onModify) this.onModify();

        return stickerObj;
    }

    remove(id) {
        const index = this.stickers.findIndex(s => s.id === id);
        if (index !== -1) {
            this.stickers[index].element.remove();
            this.stickers.splice(index, 1);
            if (this.onModify) this.onModify();
        }
    }

    clear() {
        this.stickers.forEach(s => s.element.remove());
        this.stickers = [];
    }

    getData() {
        return this.stickers.map(s => {
            const { element, ...rest } = s;
            return rest;
        });
    }

    load(stickerList) {
        this.clear();
        stickerList.forEach(s => this.add(s));
    }

    _setupInteractions(stickerObj) {
        const el = stickerObj.element;
        
        // --- Drag ---
        let isDragging = false;
        let startMouseX, startMouseY;
        let startObjX, startObjY;
        
        const updateTransform = () => {
             el.style.transform = `translate(-50%, -50%) scale(${stickerObj.scale})`;
        };

        el.onmousedown = (e) => {
            if(e.target.closest('.sticker-resize') || e.target.closest('.sticker-delete')) return;
            isDragging = true;
            
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startObjX = stickerObj.x;
            startObjY = stickerObj.y;
            
            el.style.cursor = 'grabbing';
            e.stopPropagation(); // Prevent propagation issues
        };

        const onGlobalMove = (e) => {
            if (!isDragging) return;
            
            const layerRect = this.layer.getBoundingClientRect();
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
            
            stickerObj.x = newX;
            stickerObj.y = newY;
        };

        const onGlobalUp = () => {
            if (isDragging) {
                isDragging = false;
                el.style.cursor = 'grab';
                if (this.onModify) this.onModify();
            }
        };

        document.addEventListener('mousemove', onGlobalMove);
        document.addEventListener('mouseup', onGlobalUp);

        // --- Resize ---
        const resizeHandle = el.querySelector('.sticker-resize');
        
        const onResizeStart = (e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startScale = stickerObj.scale;
            
            const onResizeMove = (mv) => {
                 const diff = mv.clientX - startX;
                 const newScale = Math.max(0.3, startScale + (diff / 100));
                 stickerObj.scale = newScale;
                 updateTransform();
            };
            
            const onResizeUp = () => {
                document.removeEventListener('mousemove', onResizeMove);
                document.removeEventListener('mouseup', onResizeUp);
                if (this.onModify) this.onModify();
            };
            
            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', onResizeUp);
        };

        resizeHandle.addEventListener('mousedown', onResizeStart);

        // --- Delete ---
        el.querySelector('.sticker-delete').onclick = (e) => {
            e.stopPropagation();
            this.remove(stickerObj.id);
        };
        
        // Cleanup listeners when element is removed? 
        // Current simple implementation relies on garbage collection of closures or explicit removal if we cared more about memory leaks for long running sessions.
        // For now, it's acceptable as the modal is short-lived.
    }
}
