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
 * File Created: Monday, 8th December 2025 5:40:12 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import Photo from "../js/Photo.js";
import User from "../js/User.js";

/**
 * 
 * @param {User} user 
 * @param {Photo[]} photos 
 * @param {string} className 
 * @returns 
 */
export default function ProfileHeader(user, photos, className) {
    const profileHeader = document.createElement('div');
    profileHeader.className = "max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 " + className ?? "";
    
    const profileImageContent = (user && user.profile_picture_url) 
        ? `<img src="${user.profile_picture_url}" alt="${user.username}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">${user ? user.username.slice(0, 2).toUpperCase() : '?'}</div>`;

    profileHeader.innerHTML = /*html*/`
    <div class="flex-shrink-0">
            <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden">
                ${profileImageContent}
            </div>
        </div>
        <div class="flex-1 flex flex-col items-center md:items-start gap-4 w-full">
            <div class="flex flex-col md:flex-row items-center gap-4">
                <h1 class="text-xl md:text-2xl font-normal">${user ? user.username : 'username'}</h1>
                <div class="flex gap-2">
                    <button class="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer">Edit profile</button>
                    <button class="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer">View archive</button>
                </div>
            </div>
            <div class="flex gap-8 text-sm md:text-base">
                <div class="flex gap-1"><span class="font-bold">0</span> posts</div>
                <div class="flex gap-1"><span class="font-bold">75</span> followers</div>
                <div class="flex gap-1"><span class="font-bold">148</span> following</div>
            </div>
            <div class="text-sm md:text-base text-center md:text-left">
                <div class="font-bold">${user ? user.fullname : 'Full Name'}</div>
                <div class="text-gray-300">Dip me in chocolate and throw me at the lesbians</div>
            </div>
        </div>
    `;

    return profileHeader;
}
