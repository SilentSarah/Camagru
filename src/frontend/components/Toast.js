/*
 *   ██████  ▄▄▄       ██▀███   ▄▄▄       ██░ ██ 
 * ▒██    ▒ ▒████▄    ▓██ ▒ ██▒▒████▄    ▓██░ ██▒
 * ░ ▓██▄   ▒██  ▀█▄  ▓██ ░▄█ ▒▒██  ▀█▄  ▒██▀▀██░
 *   ▒   ██▒░██▄▄▄▄██ ▒██▀▀█▄  ░██▄▄▄▄██ ░▓█ ░██ 
 * ▒██████▒▒ ▓█   ▓██▒░██▓ ▒██▒ ▓█   ▓██▒░▓█▒░██▓
 * ▒ ▒▓▒ ▒ ░ ▒▒   ▓▒█░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒ ░░▒░▒
 * ░ ░▒  ░ ░  ▒   ▒▒ ░  ░▒ ░ ▒░  ▒   ▒▒ ░ ▒ ░▒░ ░
 *  ░  ░  ░    ░   ▒     ░░   ░   ░   ▒    ░  ░░ ░
 * ░        ░  ░   ░           ░  ░ ░  ░  ░
 *                                       
 * File Created: Monday, 1st December 2025 12:57:04 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

/*
 * Toast Component
 * Displays a toast notification with support for presets and custom icons.
 */
const ToastContainerId = 'toast-container';

function getToastContainer() {
    let container = document.getElementById(ToastContainerId);
    if (!container) {
        container = document.createElement('div');
        container.id = ToastContainerId;
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Shows a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of toast: 'success', 'error', 'warning', 'info'.
 * @param {string} [customIcon] - Optional custom icon (URL or FontAwesome class).
 */
export function showToast(message, type = 'info', customIcon = null) {
    const container = getToastContainer();
    
    const presets = {
        success: {
            classes: 'border-green-400 bg-green-800 text-white',
            icon: 'fa-solid fa-circle-check'
        },
        error: {
            classes: 'border-red-400 bg-red-800 text-white',
            icon: 'fa-solid fa-circle-exclamation'
        },
        fail: {
            classes: 'border-red-400 bg-red-800 text-white',
            icon: 'fa-solid fa-circle-exclamation'
        },
        warning: {
            classes: 'border-yellow-400 bg-yellow-800 text-black',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        info: {
            classes: 'border-blue-400 bg-blue-800 text-white',
            icon: 'fa-solid fa-circle-info'
        }
    };

    const preset = presets[type] || presets.info;
    
    const toast = document.createElement('div');
    
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 translate-x-full opacity-0 ${preset.classes}`;
    
    let iconHtml = '';
    if (customIcon) {
        if (customIcon.includes('/') || customIcon.includes('.')) {
             iconHtml = `<img src="${customIcon}" class="w-6 h-6 object-cover rounded-full" alt="icon">`;
        } else {
             iconHtml = `<i class="${customIcon} text-xl"></i>`;
        }
    } else {
        iconHtml = `<i class="${preset.icon} text-xl"></i>`;
    }

    toast.innerHTML = /*html*/`
    <div class="flex-shrink-0">
            ${iconHtml}
        </div>
        <span class="text-sm font-medium">${message}</span>
        <button class="ml-auto hover:opacity-75 focus:outline-none transition-opacity">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.onclick = () => removeToast(toast);

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });
    setTimeout(() => {
        removeToast(toast);
    }, 3000);
}

function removeToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    
    toast.addEventListener('transitionend', () => {
        toast.remove();
        const container = document.getElementById(ToastContainerId);
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, { once: true });
}
