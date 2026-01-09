/*
 * File Created: Wednesday, 25th December 2025
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { goTo } from "../js/Utils.js";
import { user } from "../js/Auth.js";
import { openSearchModal } from "./SearchModal.js";

export default function MobileBottomBar() {
    const div = document.createElement('div');
    div.className =
        'fixed bottom-0 left-0 w-full h-16 bg-black border-t border-gray-800 flex justify-around items-center z-50 md:hidden text-white';

    div.innerHTML = /*html*/`
        <a href="/" class="flex-1 flex justify-center items-center p-2 rounded-lg hover:bg-gray-900 transition-colors">
            <i class="fa-solid fa-house text-xl"></i>
        </a>

        <button id="search_btn_mobile" class="flex-1 flex justify-center items-center p-2 rounded-lg hover:bg-gray-900 transition-colors">
            <i class="fa-solid fa-magnifying-glass text-xl"></i>
        </button>

        <button id="create_post_mobile" class="flex-1 flex justify-center items-center p-2 rounded-lg hover:bg-gray-900 transition-colors">
            <i class="fa-regular fa-square-plus text-2xl"></i>
        </button>

        <!-- Likes
        <a href="#" class="flex-1 flex justify-center items-center p-2 rounded-lg hover:bg-gray-900 transition-colors">
            <i class="fa-regular fa-heart text-xl"></i>
        </a>
        -->

        <!-- Profile / Menu -->
        <div class="relative flex-1 flex justify-center items-center">
            <button id="profile_menu_toggle" class="p-2 rounded-lg hover:bg-gray-900 transition-colors">
                <div class="w-6 h-6 rounded-full bg-gray-600 overflow-hidden">
                    <img src="${user.profile_picture_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`}"
                         alt="Profile"
                         class="w-full h-full object-cover">
                </div>
            </button>

            <!-- Popover -->
            <div id="profile_menu"
                 class="hidden absolute bottom-14 right-1/2
                        w-40 bg-neutral-900 border border-neutral-800
                        rounded-xl shadow-xl overflow-hidden">

                <button id="go_profile_mobile"
                        class="w-full px-4 py-3 text-sm text-left hover:bg-neutral-800 transition-colors">
                    Profile
                </button>

                <div class="h-px bg-neutral-800"></div>

                <button id="go_settings_mobile"
                        class="w-full px-4 py-3 text-sm text-left hover:bg-neutral-800 transition-colors">
                    Settings
                </button>

                <div class="h-px bg-neutral-800"></div>

                <button id="sign_out_mobile"
                        class="w-full px-4 py-3 text-sm text-left text-red-400 hover:bg-neutral-800 transition-colors">
                    Sign out
                </button>
            </div>
        </div>
    `;

    const menuToggle = div.querySelector('#profile_menu_toggle');
    const menu = div.querySelector('#profile_menu');

    menuToggle.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    };

    document.onclick = () => menu.classList.add('hidden');

    div.querySelector('#go_profile_mobile').onclick = () => {
        goTo('/profile');
    };

    div.querySelector('#go_settings_mobile').onclick = () => {
        goTo('/settings');
    };

    div.querySelector('#sign_out_mobile').onclick = () => {
        document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        goTo('/signin');
    };

    div.querySelector('#create_post_mobile').onclick = () => {
        goTo('/editor');
    };

    div.querySelector('#search_btn_mobile').onclick = () => {
        openSearchModal();
    };

    return div;
}
