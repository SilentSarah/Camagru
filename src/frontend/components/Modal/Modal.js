/*
 * File Created: Tuesday, 16th December 2025
 * Author: Camagru Team
 */

/**
 * Generic Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {string} props.title - Optional title
 * @param {HTMLElement|string} props.children - Modal content
 * @returns {HTMLElement} The modal overlay element
 */
export default function Modal({ isOpen = true, onClose, title, children, className = '', hideCloseButton = false }) {
    if (!isOpen) return document.createDocumentFragment();

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity opacity-0';
    overlay.id = 'modal-overlay';

    // Container
    const container = document.createElement('div');
    container.className = `relative bg-insta rounded-xl shadow-2xl border border-gray-800 transform scale-95 transition-all duration-200 opacity-0 ${className}`;
    container.style.maxHeight = '90vh';
    container.style.maxWidth = '95vw';
    
    // Header (if title exists)
    if (title) {
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between p-4 border-b border-gray-800';
        header.innerHTML = `
            <h2 class="text-lg font-semibold text-white">${title}</h2>
            <button class="modal-close-btn text-gray-400 hover:text-white transition-colors">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        `;
        header.querySelector('.modal-close-btn').onclick = () => close();
        container.appendChild(header);
    }

    // Content
    const content = document.createElement('div');
    content.className = title ? '' : 'relative'; 
    
    if (typeof children === 'string') {
        content.innerHTML = children;
    } else if (children instanceof HTMLElement) {
        content.appendChild(children);
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (child instanceof HTMLElement) content.appendChild(child);
        });
    }

    // Add close button if no title (floating close)
    if (!title && !hideCloseButton) {
        const floatClose = document.createElement('button');
        floatClose.className = 'absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md';
        floatClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        floatClose.onclick = () => close();
        content.appendChild(floatClose);
    }

    container.appendChild(content);
    overlay.appendChild(container);

    // Animation Logic
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        container.classList.remove('scale-95', 'opacity-0');
        container.classList.add('scale-100', 'opacity-100');
    });

    const close = () => {
        overlay.classList.add('opacity-0');
        container.classList.remove('scale-100', 'opacity-100');
        container.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            overlay.remove();
            if (onClose) onClose();
        }, 200);
    };

    // Event Listeners
    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    return overlay;
}
