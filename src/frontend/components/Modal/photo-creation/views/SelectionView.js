/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

import { showToast } from '../../../Toast.js';

export function createSelectionView({ onUpload, onCamera, onRecents, recents = [] }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full gap-4 p-8';
    
    container.innerHTML = `
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
                            <img src="${r.thumbnail}" class="w-full h-full object-cover pointer-events-none">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    container.querySelector('#btn-upload').onclick = () => container.querySelector('#file-input').click();
    container.querySelector('#btn-camera').onclick = onCamera;
    container.querySelector('#btn-recents').onclick = onRecents;
    
    container.querySelector('#file-input').onchange = (e) => {
        const file = e.target.files[0];
        if (file) validateAndSelectFile(file, onUpload);
    };
    
    container.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        container.classList.add('bg-gray-800');
    };
    container.ondragleave = (e) => {
        e.preventDefault();
        container.classList.remove('bg-gray-800');
    };
    container.ondrop = (e) => {
        e.preventDefault();
        container.classList.remove('bg-gray-800');
        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndSelectFile(file, onUpload);
        }
    };

    container.querySelectorAll('.recent-item').forEach(item => {
        item.onclick = () => {
            const index = parseInt(item.dataset.index);
            const recent = recents[index];
            if (recent) {
                if (container.onSelectRecent) container.onSelectRecent(recent);
            }
        };
    });
    
    container.setOnSelectRecent = (cb) => { container.onSelectRecent = cb; };

    return container;
}

function validateAndSelectFile(file, callback) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        showToast('SVG files are not supported. Please use PNG, JPG, or GIF', 'error');
        return;
    }
    callback(file);
}
