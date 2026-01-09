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
 * File Created: Monday, 24th November 2025 11:48:08 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import Post, { PostSkeleton } from '../components/Post.js';
import { getCookie } from '../js/Utils.js';
import { showToast } from '../components/Toast.js';
import { abortController } from '../js/Router.js';
import apiFetch from '../js/ApiClient.js';

export default async function Home() {
    let cursor = 0;
    let isLoading = false;
    let hasMore = true;
    
    const container = document.createElement('div');
    container.className = 'flex justify-center w-full h-full bg-black text-white overflow-y-auto pb-20 md:pb-0';
    
    container.innerHTML = /*html*/`
        <div class="w-full max-w-[470px] py-8 px-4">
            <div class="flex flex-col gap-4 mx-auto" id="feed-container"></div>
            <div id="feed-sentinel" class="w-full py-8 flex justify-center items-center">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <div id="empty-state" class="hidden text-center py-16">
                <i class="fa-regular fa-image text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">No posts yet</p>
                <p class="text-gray-500 text-sm mt-2">Be the first to share something!</p>
            </div>
        </div>
    `;

    const feedContainer = container.querySelector('#feed-container');
    const sentinel = container.querySelector('#feed-sentinel');
    const emptyState = container.querySelector('#empty-state');
    const session_token = getCookie('session_token');

    for (let i = 0; i < 3; i++) {
        feedContainer.appendChild(PostSkeleton());
    }

    const fetchPosts = async () => {
        if (isLoading || !hasMore) return [];
        isLoading = true;

        try {
            const res = await apiFetch(`${window.env.APP_URL}/feed?limit=${window.env.PHOTOS_PER_PAGE}&cursor=${cursor}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${session_token}`
                },
                signal: abortController.signal
            });

            if (!res.ok) {
                showToast('Failed to load feed', 'error');
                return [];
            }

            const data = await res.json();
            const posts = data.data || [];

            if (posts.length < window.env.PHOTOS_PER_PAGE) {
                hasMore = false;
            }

            cursor += posts.length;
            return posts;
        } catch (e) {
            showToast('Failed to load feed', 'error');
            return [];
        } finally {
            isLoading = false;
        }
    };

    const renderPosts = (posts) => {
        posts.forEach(photo => {
            const postEl = Post({ photo });
            feedContainer.appendChild(postEl);
        });
    };

    const initialPosts = await fetchPosts();
    
    feedContainer.innerHTML = '';
    
    if (initialPosts.length === 0) {
        emptyState.classList.remove('hidden');
        sentinel.classList.add('hidden');
    } else {
        renderPosts(initialPosts);
    }

    if (!hasMore) {
        sentinel.classList.add('hidden');
    }

    const observer = new IntersectionObserver(async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && hasMore) {
            const newPosts = await fetchPosts();
            if (newPosts.length > 0) {
                renderPosts(newPosts);
            }
            if (!hasMore) {
                sentinel.classList.add('hidden');
                observer.disconnect();
            }
        }
    }, {
        root: container,
        rootMargin: '200px',
        threshold: 0.1
    });

    if (hasMore) {
        observer.observe(sentinel);
    }

    return container;
}
