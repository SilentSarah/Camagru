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
 * File Created: Monday, 24th November 2025 11:41:02 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { goTo } from "../js/Utils.js";
import { user } from "../js/Auth.js";
import { openSearchModal } from "./SearchModal.js";


export default function Sidebar() {
    const div = document.createElement('div');
    div.className = 'group w-16 hover:w-64 hidden md:flex flex-col border-gray-700 h-full fixed left-0 top-0 z-50 bg-black transition-all duration-300 overflow-hidden text-white';
    div.innerHTML = /*html*/`
        <div class="p-4 mb-4 h-16 flex items-center justify-start">
            <img src="/public/CG.svg" alt="Logo" class="h-8 group-hover:hidden flex-shrink-0">
            <img src="/public/Camagru.svg" alt="Logo" class="h-8 hidden group-hover:block flex-shrink-0">
        </div>

        <nav class="flex-1 flex flex-col gap-2 px-2 justify-center">
            <a href="/" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-house text-xl w-6 text-center flex-shrink-0"></i>
                <span class="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Home</span>
            </a>
            <button id="search_btn" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-magnifying-glass text-xl w-6 text-center flex-shrink-0"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Search</span>
            </button>
            <!--
            <button id="notifications" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-heart text-xl w-6 text-center flex-shrink-0"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Notifications</span>
            </button>
            -->
            <button id="create_post" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-square-plus text-xl w-6 text-center flex-shrink-0"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Create</span>
            </button>
            <a href="/profile" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <div class="w-6 h-6 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
                    <img src=${user.profile_picture_url ?? `https://ui-avatars.com/api/?name=${user.username}`} alt="Profile" class="w-full h-full object-cover">
                </div>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">${user.username}</span>
            </a>
        </nav>

        <div class="p-2 mt-auto">
            <a href="/settings" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-gear text-xl w-6 text-center flex-shrink-0"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Settings</span>
            </a>
            <button id="sign-out" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-right-from-bracket text-xl w-6 text-center flex-shrink-0"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sign Out</span>
            </button>
        </div>
    `;

    div.querySelector('#sign-out').onclick = () => {
        document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        goTo("/signin");
    }
    div.querySelector('#create_post').onclick = () => {
        goTo('/editor');
    }
    div.querySelector('#search_btn').onclick = () => {
        openSearchModal();
    }
    return div;
}
