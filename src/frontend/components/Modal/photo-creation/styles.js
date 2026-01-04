/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

let styleElement = null;

export const injectStyles = () => {
    if (styleElement) return; // Already injected

    styleElement = document.createElement('style');
    styleElement.innerHTML = `
        .sticker-overlay {
            position: absolute;
            user-select: none;
            // touch-action: none;
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
            // touch-action: none;
            overflow: hidden; 
        }
    `;
    document.head.appendChild(styleElement);
};

export const removeStyles = () => {
    if (styleElement) {
        styleElement.remove();
        styleElement = null;
    }
};
