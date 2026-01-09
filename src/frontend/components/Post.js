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
 * File Created: Monday, 24th November 2025 11:48:05 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { getCookie, goTo, escapeHtml } from '../js/Utils.js';
import FetchCSRF from '../js/Csrf.js';
import { showToast } from './Toast.js';
import apiFetch from '../js/ApiClient.js';
import ShareDropdown, { generateShareLinks } from './post-modal/ShareDropdown.js';

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 4) return `${diffWeeks}w`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Post component for home feed
 */
export default function Post({ photo, onLikeUpdate }) {
    const user = photo.user || { username: 'Unknown', profile_picture_url: null };
    const avatar = user.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`;
    const time = formatRelativeTime(photo.created_at);
    const imageUrl = `${window.env.UPLOADS_URL}/${photo.file_name}`;
    
    let isLiked = photo.is_liked_by_user || false;
    let likesCount = photo.likes || 0;

    const div = document.createElement('div');
    div.className = 'border-b border-gray-800 pb-4 mb-4';
    div.dataset.postId = photo.id;
    
    div.innerHTML = /*html*/`
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
                <a href="/profile?user_id=${user.id}" class="rounded-full border border-gray-800 overflow-hidden w-8 h-8 hover:opacity-80 transition-opacity">
                    <img src="${avatar}" alt="${escapeHtml(user.username)}" class="w-full h-full object-cover">
                </a>
                <div class="flex items-center gap-2">
                    <a href="/profile?user_id=${user.id}" class="font-bold text-sm hover:underline">${escapeHtml(user.username)}</a>
                    <span class="text-gray-500 text-sm">• ${time}</span>
                </div>
            </div>
        </div>

        <!-- Content (Image) -->
        <div class="rounded-sm overflow-hidden border border-gray-800 mb-3 bg-gray-900 flex items-center justify-center aspect-[4/5] cursor-pointer post-image-container">
            <img src="${imageUrl}" alt="Post by ${escapeHtml(user.username)}" class="w-full h-full object-cover">
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-4">
                <button class="like-btn hover:text-gray-400 transition-colors ${isLiked ? 'text-red-500' : 'text-white'}">
                    <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl"></i>
                </button>
                <button class="comment-btn hover:text-gray-400 transition-colors">
                    <i class="fa-regular fa-comment text-2xl"></i>
                </button>
                <div class="relative share-container">
                    <button class="share-btn hover:text-gray-400 transition-colors">
                        <i class="fa-regular fa-paper-plane text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Likes -->
        <div class="font-bold text-sm mb-2 likes-count">${likesCount.toLocaleString()} likes</div>

        <!-- Caption -->
        ${photo.description ? `
        <div class="text-sm mb-2">
            <a href="/profile?user_id=${user.id}" class="font-bold mr-2 hover:underline">${escapeHtml(user.username)}</a>
            <span class="text-gray-100">${escapeHtml(photo.description)}</span>
        </div>
        ` : ''}

        <!-- Comments Link -->
        ${photo.comments_count > 0 ? `
        <div class="text-gray-500 text-sm cursor-pointer mb-2 view-comments-btn hover:text-gray-400">View all ${photo.comments_count} comments</div>
        ` : ''}
    `;

    const likeBtn = div.querySelector('.like-btn');
    const likesCountEl = div.querySelector('.likes-count');
    const imageContainer = div.querySelector('.post-image-container');
    const commentBtn = div.querySelector('.comment-btn');
    const viewCommentsBtn = div.querySelector('.view-comments-btn');
    const shareBtn = div.querySelector('.share-btn');

    const openPost = () => goTo(`/post?id=${photo.id}`);

    const toggleLike = async () => {
        likeBtn.disabled = true;
        likeBtn.classList.add('animate-pulse', 'opacity-50');
        
        isLiked = !isLiked;
        likesCount = isLiked ? likesCount + 1 : likesCount - 1;
        
        likeBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl"></i>`;
        likeBtn.classList.toggle('text-red-500', isLiked);
        likeBtn.classList.toggle('text-white', !isLiked);
        likesCountEl.textContent = `${likesCount.toLocaleString()} likes`;

        try {
            const response = await apiFetch(`${window.env.APP_URL}/toggle-like`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie("session_token")}`,
                    'X-CSRF-TOKEN': await FetchCSRF()
                },
                body: JSON.stringify({ photo_id: photo.id })
            });

            if (!response.ok) throw new Error('Failed to toggle like');
            
            if (onLikeUpdate) onLikeUpdate(photo.id, isLiked, likesCount);
        } catch (error) {
            isLiked = !isLiked;
            likesCount = isLiked ? likesCount + 1 : likesCount - 1;
            likeBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl"></i>`;
            likeBtn.classList.toggle('text-red-500', isLiked);
            likeBtn.classList.toggle('text-white', !isLiked);
            likesCountEl.textContent = `${likesCount.toLocaleString()} likes`;
            showToast('Failed to update like', 'error');
        } finally {
            likeBtn.disabled = false;
            likeBtn.classList.remove('animate-pulse', 'opacity-50');
        }
    };

    let lastClick = 0;
    let clickTimeout = null;
    imageContainer.onclick = (e) => {
        const now = Date.now();
        if (now - lastClick < 300) {
            clearTimeout(clickTimeout);
            if (!isLiked) {
                toggleLike();
            }
        } else {
            clickTimeout = setTimeout(() => {
                openPost();
            }, 300);
        }
        lastClick = now;
    };

    likeBtn.onclick = toggleLike;
    if (commentBtn) commentBtn.onclick = openPost;
    if (viewCommentsBtn) viewCommentsBtn.onclick = openPost;
    
    const shareContainer = div.querySelector('.share-container');
    if (shareBtn && shareContainer) {
        const shareLinks = generateShareLinks({
            postId: photo.id,
            userId: user.id,
            description: photo.description,
            imagePath: imageUrl
        });
        
        shareContainer.insertAdjacentHTML('beforeend', ShareDropdown({ shareLinks, hidden: true }));
        const shareDropdown = shareContainer.querySelector('#share-dropdown');
        const copyLinkBtn = shareContainer.querySelector('#copy-link-btn');
        
        shareBtn.onclick = (e) => {
            e.stopPropagation();
            shareDropdown.classList.toggle('hidden');
        };
        
        document.addEventListener('click', (e) => {
            if (!shareBtn.contains(e.target) && !shareDropdown.contains(e.target)) {
                shareDropdown.classList.add('hidden');
            }
        });
        
        if (copyLinkBtn) {
            copyLinkBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(shareLinks.postUrl);
                    showToast('Link copied!', 'success');
                    shareDropdown.classList.add('hidden');
                } catch (e) {
                    showToast('Failed to copy link', 'error');
                }
            };
        }
    }

    return div;
}

export function PostSkeleton() {
    const div = document.createElement('div');
    div.className = 'border-b border-gray-800 pb-4 mb-4 animate-pulse';
    div.innerHTML = /*html*/`
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
                <div class="rounded-full bg-gray-800 w-8 h-8"></div>
                <div class="flex flex-col gap-2">
                    <div class="h-3 bg-gray-800 rounded w-24"></div>
                    <div class="h-2 bg-gray-800 rounded w-12"></div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="rounded-sm overflow-hidden border border-gray-800 mb-3 bg-gray-900 aspect-[4/5]"></div>

        <!-- Actions -->
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-4">
                <div class="w-6 h-6 bg-gray-800 rounded-full"></div>
                <div class="w-6 h-6 bg-gray-800 rounded-full"></div>
                <div class="w-6 h-6 bg-gray-800 rounded-full"></div>
            </div>
        </div>

        <!-- Likes -->
        <div class="h-3 bg-gray-800 rounded w-20 mb-2"></div>

        <!-- Caption -->
        <div class="space-y-2 mb-2">
            <div class="h-3 bg-gray-800 rounded w-3/4"></div>
            <div class="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
    `;
    return div;
}
