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
import { user } from "../js/Auth.js";
import { escapeHtml } from "../js/Utils.js";

/**
 * 
 * @param {User} viewedUser 
 * @param {string} className 
 * @param {number} postsCount 
 * @returns 
 */
export default function ProfileHeader(viewedUser, className, postsCount) {
    const profileHeader = document.createElement('div');
    profileHeader.className = "max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 " + className ?? "";
    
    const profileImageContent = (viewedUser && viewedUser.profile_picture_url) 
        ? `<img src="${viewedUser.profile_picture_url}" alt="${escapeHtml(viewedUser.username)}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">${viewedUser ? escapeHtml(viewedUser.username.slice(0, 2).toUpperCase()) : '?'}</div>`;

    profileHeader.innerHTML = /*html*/`
    <div class="flex-shrink-0">
            <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden">
                ${profileImageContent}
            </div>
        </div>
        <div class="flex-1 flex flex-col items-center md:items-start gap-4 w-full">
            <div class="flex flex-col md:flex-row items-center gap-4">
                <h1 class="text-xl md:text-2xl font-normal">${viewedUser ? escapeHtml(viewedUser.username) : 'username'}</h1>
                ${viewedUser.id === user.id ? `<div class="flex gap-2">
                    <a href="/settings" class="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer">Edit profile</a>
                </div>` : ""}
            </div>
            <div class="flex gap-8 text-sm md:text-base">
                <div class="flex gap-1"><span class="font-bold">${postsCount}</span> posts</div>
            </div>
            <div class="text-sm md:text-base text-center md:text-left">
                <div class="font-bold">${viewedUser ? escapeHtml(viewedUser.fullname) : 'Full Name'}</div>
                <div class="text-gray-300">${viewedUser && viewedUser.bio ? escapeHtml(viewedUser.bio) : ""}</div></div>
            </div>
        </div>
    `;

    return profileHeader;
}
