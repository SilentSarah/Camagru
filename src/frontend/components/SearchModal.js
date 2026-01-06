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
 * File Created: Sunday, 29th December 2025
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import apiFetch from '../js/ApiClient.js';
import { abortController } from '../js/Router.js';
import { getCookie, goTo } from '../js/Utils.js';

let searchDrawer = null;
let escHandler = null;

export function openSearchModal() {
    if (searchDrawer) {
        closeSearchModal();
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 z-40 md:hidden opacity-0 transition-opacity duration-300';
    
    searchDrawer = document.createElement('div');
    searchDrawer.id = 'search-drawer';
    searchDrawer.className = `
        fixed z-50 bg-neutral-950 border-neutral-800 flex flex-col
        /* Mobile: bottom drawer */
        bottom-0 left-0 right-0 h-[90vh]  border-t
        translate-y-full
        /* Desktop: left sidebar drawer */
        md:top-0 md:bottom-0 md:left-[0px] md:right-auto md:h-full md:w-[400px] md:rounded-none md:border-t-0 md:border-r
        md:translate-y-0 md:-translate-x-full
        transition-transform duration-300 ease-out
    `;
    
    searchDrawer.innerHTML = /*html*/`
        <!-- Drag handle for mobile -->
        <div class="md:hidden flex justify-center py-3">
            <div class="w-12 h-1 bg-neutral-600 rounded-full"></div>
        </div>
        
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <h2 class="text-xl font-bold text-white">Search</h2>
            <button id="close-search" class="text-white text-xl hover:text-gray-400 transition-colors p-2">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        
        <!-- Search input -->
        <div class="px-4 py-3">
            <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Search users..." 
                    class="w-full bg-neutral-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                    autocomplete="off"
                >
            </div>
        </div>
        
        <!-- Results container -->
        <div id="search-results" class="flex-1 overflow-y-auto px-4 pb-4">
            <div class="text-center text-gray-500 py-8">
                Start typing to search for users
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(searchDrawer);
    
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        searchDrawer.classList.remove('translate-y-full', 'md:-translate-x-full');
        searchDrawer.classList.add('translate-y-0', 'md:translate-x-0');
    });
    
    const input = searchDrawer.querySelector('#search-input');
    setTimeout(() => input.focus(), 300);
    
    searchDrawer.querySelector('#close-search').onclick = closeSearchModal;
    
    overlay.onclick = closeSearchModal;
    
    escHandler = (e) => {
        if (e.key === 'Escape') {
            closeSearchModal();
        }
    };
    document.addEventListener('keydown', escHandler);
    
    let debounceTimer;
    input.oninput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => searchUsers(input.value), 300);
    };
    
    const dragHandle = searchDrawer.querySelector('.md\\:hidden');
    if (dragHandle) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        const onTouchStart = (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            searchDrawer.style.transition = 'none';
        };
        
        const onTouchMove = (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                searchDrawer.style.transform = `translateY(${deltaY}px)`;
            }
        };
        
        const onTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            searchDrawer.style.transition = '';
            
            const deltaY = currentY - startY;
            
            if (deltaY > 100) {
                closeSearchModal();
            } else {
                searchDrawer.style.transform = '';
            }
        };
        
        dragHandle.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
    }
}

function closeSearchModal() {
    if (!searchDrawer) return;
    
    const overlay = document.getElementById('search-overlay');
    const drawerRef = searchDrawer;
    searchDrawer = null;
    
    if (overlay) {
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
    }
    drawerRef.classList.remove('translate-y-0', 'md:translate-x-0');
    drawerRef.classList.add('translate-y-full', 'md:-translate-x-full');
    
    setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (drawerRef && drawerRef.parentNode) drawerRef.parentNode.removeChild(drawerRef);
    }, 300);
    
    if (escHandler) {
        document.removeEventListener('keydown', escHandler);
        escHandler = null;
    }
}

async function searchUsers(query) {
    const resultsContainer = searchDrawer?.querySelector('#search-results');
    if (!resultsContainer) return;
    
    if (query.length < 2) {
        resultsContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                ${query.length === 0 ? 'Start typing to search for users' : 'Type at least 2 characters'}
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
            <i class="fa-solid fa-spinner animate-spin text-2xl"></i>
        </div>
    `;
    
    try {
        const token = getCookie('session_token');
        const response = await apiFetch(`${window.env.APP_URL}index.php/search-users?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            signal: abortController?.signal
        });
        
        const data = await response.json();
        
        if (data.users && data.users.length > 0) {
            resultsContainer.innerHTML = data.users.map(user => `
                <a href="/profile?user_id=${user.id}" class="user-result flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer" data-user-id="${user.id}">
                    <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-700 shrink-0">
                        <img src="${user.profile_pic_url || `https://ui-avatars.com/api/?name=${user.username}`}" alt="${user.username}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-semibold text-white truncate">${user.username}</div>
                        <div class="text-sm text-gray-400 truncate">${user.fullname || ''}</div>
                    </div>
                </a>
            `).join('');
            
            resultsContainer.querySelectorAll('.user-result').forEach(el => {
                el.onclick = (e) => {
                    e.preventDefault();
                    const userId = el.dataset.userId;
                    closeSearchModal();
                    goTo(`/profile?user_id=${userId}`);
                };
            });
        } else {
            resultsContainer.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    No users found for "${query}"
                </div>
            `;
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            resultsContainer.innerHTML = `
                <div class="text-center text-red-500 py-8">
                    Search failed. Please try again.
                </div>
            `;
        }
    }
}

export default openSearchModal;
