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


export default function Sidebar() {
    const div = document.createElement('div');
    div.className = 'group w-16 hover:w-64 flex flex-col border-gray-700 h-full fixed left-0 top-0 z-50 bg-black transition-all duration-300 overflow-hidden text-white';
    div.innerHTML = /*html*/`
        <div class="p-6 mb-4 hidden group-hover:block transition-opacity duration-300">
            <img src="/public/Camagru.svg" alt="Logo" class="h-8">
        </div>
        <div class="p-4 mb-4 group-hover:hidden flex justify-center transition-opacity duration-300">
             <img src="/public/CG.svg" alt="Logo" class="h-8">
        </div>

        <nav class="flex-1 flex flex-col gap-2 px-2 justify-center">
            <a href="/" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-house text-xl w-6 text-center"></i>
                <span class="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Home</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-magnifying-glass text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Search</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-heart text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Notifications</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-square-plus text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Create</span>
            </a>
            <a href="/profile" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <div class="w-6 h-6 rounded-full bg-gray-600 overflow-hidden">
                    <img src=${user.profile_picture_url ?? `https://ui-avatars.com/api/?name=${user.username}`} alt="Profile" class="w-full h-full object-cover">
                </div>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">${user.username}</span>
            </a>
        </nav>

        <div class="p-2 mt-auto">
            <button id="sign-out" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-right-from-bracket text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sign Out</span>
            </button>
        </div>
    `;

    div.querySelector('#sign-out').onclick = () => {
        document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        goTo("/signin");
    }
    return div;
}
