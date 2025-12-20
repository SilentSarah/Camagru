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
 * File Created: Monday, 8th December 2025 5:40:14 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { user } from "../js/Auth.js";
import Photo from "../js/Photo.js";
import { openPostModal } from "./Modal/PostViewModal.js";
import { openPhotoCreationModal as openPhotoModal } from './Modal/PhotoCreationModal.js';


/**
 * 
 * @param {Photo[]} photos 
 * @returns 
 */
export default function ProfileContent(photos) {
    const contentSection = document.createElement('div');
    contentSection.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto border-t border-gray-800 pt-12";

    if (photos.length === 0) {
        contentSection.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center text-center py-12 col-span-full">
            <div class="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
            </div>
            <h2 class="text-2xl font-bold mb-2">Share Photos</h2>
            <p class="text-gray-400 mb-4 text-sm">When you share photos, they will appear on your profile.</p>
            <button id="share-photo-button" class="text-blue-500 font-semibold text-sm hover:text-blue-400 hover:cursor-pointer transition-colors">Share your first photo</button>
        </div>`;
        const sharePhotoButton = contentSection.querySelector('#share-photo-button');
        sharePhotoButton.onclick = () => {
            openPhotoModal({
                onPost: ({ imageUrl }) => { /* handle saved image */ },
                onClose: () => { /* handle close */ }
            });
        }
    } else {
        photos.forEach(photo => {
            const likesCount = photo.likes || Math.floor(Math.random() * 1000);
            const commentsCount = photo.comments?.length || Math.floor(Math.random() * 100);
            
            const element = document.createElement('div');
            element.className = "relative group aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer w-72 h-96";
            element.innerHTML = /*html*/`
                <img src="${photo.image_path}" alt="Photo by ${photo.user_id}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-75 transition-opacity duration-300">
                    <div class="flex items-center text-white text-lg font-semibold mx-2 gap-1">
                        <i class="fa-regular fa-heart"></i>
                        <span>${likesCount}</span>
                    </div>
                    <div class="flex items-center text-white text-lg font-semibold mx-2 gap-1">
                        <i class="fa-regular fa-comment"></i>
                        <span>${commentsCount}</span>
                    </div>
                </div>
            `;
            
            element.onclick = () => {
                openPostModal({
                    photo: photo,
                    user: user,
                    likes: likesCount,
                    comments: photo.comments || [],
                    onClose: () => {
                        console.log('Modal closed');
                    },
                    onLike: (isLiked) => {
                        console.log('Like toggled:', isLiked);
                        // Here you would typically make an API call to like/unlike
                    },
                    onComment: (comment) => {
                        console.log('New comment:', comment);
                        // Here you would typically make an API call to post the comment
                    }
                });
            };
            
            contentSection.appendChild(element);
        });
    }

    return contentSection;
}
