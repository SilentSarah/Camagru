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
 * File Created: Monday, 8th December 2025 5:37:17 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { user } from "../js/Auth.js";
import ProfileHeader from "../components/ProfileHeader.js";
import ProfileContent, { renderPhotoCard } from "../components/ProfileContent.js";
import { showToast } from "../components/Toast.js";
import { getCookie } from "../js/Utils.js";
import { abortController } from "../js/Router.js";
import apiFetch from "../js/ApiClient.js";

export default async function Profile() {
    let photos = [];
    let profileUser = user;
    let postsCount = 0;
    let cursor = 0;
    let isLoading = false;
    let hasMore = true;

    const meta = {
        title: user.username,
        description: user.bio,
        image: `${user.profile_picture_url}`,
        type: "profile:username"
    };

    Object.entries(meta).forEach(([key, value]) => {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute('property', `og:${key}`);
        metaTag.setAttribute('content', value);
        document.head.appendChild(metaTag);
    });
    
    const container = document.createElement('div');
    container.className = "h-screen w-screen flex flex-col justify-start items-center bg-black text-white p-4 md:p-8 font-sans overflow-y-auto pb-20 md:pb-0";

    const session_token = getCookie('session_token');
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    
    if (userId && parseInt(userId) !== user.id) {
        try {
            const userRes = await apiFetch(`${window.env.APP_URL}/user-profile?user_id=${userId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${session_token}`
                },
                signal: abortController.signal
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                profileUser = {
                    id: userData.user.id,
                    username: userData.user.username,
                    fullname: userData.user.fullname,
                    bio: userData.user.bio,
                    profile_picture_url: userData.user.profile_pic_url
                };
            } else {
                showToast("User not found", "error");
                return container;
            }
        } catch (error) {
            showToast("Failed to load user profile", "error");
            return container;
        }
    }
    
    const fetchPhotos = async () => {
        if (isLoading || !hasMore) return;
        isLoading = true;
        
        try {
            const res = await apiFetch(`${window.env.APP_URL}/photos?user_id=${profileUser.id}&limit=${window.env.PHOTOS_PER_PAGE}&cursor=${cursor}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${session_token}`
                },
                signal: abortController.signal
            });
            
            if (!res.ok) {
                showToast("Failed to fetch photos", "error");
                return;
            }
            
            const obj = await res.json();
            const newPhotos = obj.data || [];
            postsCount = obj.posts;
            
            if (newPhotos.length < window.env.PHOTOS_PER_PAGE) {
                hasMore = false;
            }
            
            cursor += newPhotos.length;
            
            photos = [...photos, ...newPhotos];
            
            return newPhotos;
        } catch (error) {
            showToast("Failed to fetch photos", "error");
        } finally {
            isLoading = false;
        }
    };
    
    const initialPhotos = await fetchPhotos();
    
    container.appendChild(ProfileHeader(profileUser, "mt-8", postsCount));
    
    const contentSection = ProfileContent(profileUser, initialPhotos || []);
    container.appendChild(contentSection);
    
    const sentinel = document.createElement('div');
    sentinel.className = 'w-full py-8 flex justify-center items-center';
    sentinel.innerHTML = `
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    `;

    if (hasMore) {
        container.appendChild(sentinel);
    }

    if (!initialPhotos || initialPhotos.length === 0) {
        sentinel.classList.add('hidden');
    }
    const observer = new IntersectionObserver(async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && hasMore) {
            const newPhotos = await fetchPhotos();
            
            if (newPhotos && newPhotos.length > 0) {
                for (const photo of newPhotos) {
                    const card = await renderPhotoCard(photo);
                    if (card) {
                        contentSection.appendChild(card);
                    }
                }
            }
            
            if (!hasMore) {
                sentinel.remove();
                observer.disconnect();
            }
        }
    }, {
        rootMargin: '200px',
        threshold: 1
    });
    
    observer.observe(sentinel);
    return container;
}

