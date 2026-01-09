/*
 * File Created: Friday, 26th December 2025
 * Author: Camagru Team
 */

import Modal from './Modal.js';
import { escapeHtml } from '../../js/Utils.js';

/**
 * Confirmation Modal Content
 * @param {Object} props
 * @param {string} props.message
 * @param {string} props.confirmText
 * @param {string} props.cancelText
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 */
function ConfirmationModalContent({ message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
    const container = document.createElement('div');
    container.className = 'w-[260px] md:w-[400px] flex flex-col bg-[#262626] rounded-xl overflow-hidden shadow-xl animate-scale-up';

    container.innerHTML = `
        <div class="flex flex-col items-center p-6 text-center border-b border-gray-700">
            ${message ? `
                <h3 class="text-xl font-bold text-white mb-2">${escapeHtml(message)}</h3>
                <p class="text-gray-400 text-sm">Are you sure you want to delete this?</p>
            ` : ''}
        </div>
        <button id="confirm-btn" class="w-full p-4 text-red-500 font-bold hover:bg-white/5 transition-colors border-b border-gray-700 text-sm">
            ${escapeHtml(confirmText)}
        </button>
        <button id="cancel-btn" class="w-full p-4 text-white hover:bg-white/5 transition-colors text-sm">
            ${escapeHtml(cancelText)}
        </button>
    `;

    const cancelBtn = container.querySelector('#cancel-btn');
    const confirmBtn = container.querySelector('#confirm-btn');

    cancelBtn.onclick = onCancel;
    confirmBtn.onclick = onConfirm;

    return container;
}

/**
 * Helper to open a confirmation modal
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} options.confirmText
 * @param {string} options.cancelText
 * @param {Function} options.onConfirm
 * @param {Function} options.onCancel
 */
export function openConfirmationModal({ title = 'Confirmation', message, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel }) {
    let modal = null;

    const handleClose = () => {
        if (modal) modal.remove();
        if (onCancel) onCancel();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        if (modal) modal.remove();
        document.body.style.overflow = '';
    };

    const content = ConfirmationModalContent({
        message,
        confirmText,
        cancelText,
        onConfirm: handleConfirm,
        onCancel: handleClose
    });

    modal = Modal({
        isOpen: true,
        onClose: handleClose,
        title: null,
        children: content,
        className: 'w-auto p-0 bg-transparent shadow-none',
        hideCloseButton: true
    });

    document.body.appendChild(modal);
    return modal;
}
