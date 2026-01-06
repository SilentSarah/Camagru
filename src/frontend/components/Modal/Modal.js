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
export default function Modal({ isOpen = true, onClose, title, children, className = '', hideCloseButton = false, externalClose = false }) {
    if (!isOpen) return document.createDocumentFragment();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity opacity-0';
    overlay.id = 'modal-overlay';

    const container = document.createElement('div');
    container.className = `relative bg-insta rounded-xl shadow-2xl border border-gray-800 transform scale-95 transition-all duration-200 opacity-0 ${className}`;
    container.style.maxHeight = '90vh';
    container.style.maxWidth = '95vw';
    
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

    if (!title && !hideCloseButton) {
        if (externalClose) {
            const extClose = document.createElement('button');
            extClose.className = 'absolute top-6 right-6 text-white hover:text-gray-300 z-50 w-10 h-10 flex items-center justify-center transition-transform hover:scale-110';
            extClose.innerHTML = '<i class="fa-solid fa-xmark text-2xl"></i>';
            extClose.onclick = (e) => {
                e.stopPropagation();
                close();
            };
            overlay.appendChild(extClose);
        } else {
            const floatClose = document.createElement('button');
            floatClose.className = 'absolute top-4 right-4 text-white hover:text-gray-300 z-50 w-8 h-8 flex items-center justify-center';
            floatClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            floatClose.onclick = () => close();
            content.appendChild(floatClose);
        }
    }

    container.appendChild(content);
    overlay.appendChild(container);

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
            document.body.style.overflow = originalOverflow;
            if (onClose) onClose();
        }, 200);
    };

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
