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


export default function Post({ username, avatar, time, content, likes, caption, commentCount }) {
    const div = document.createElement('div');
    div.className = 'border-b border-gray-800 pb-4 mb-4';
    div.innerHTML = /*html*/`
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
                <div class="rounded-full border border-black overflow-hidden w-8 h-8">
                    <img src="${avatar}" alt="Avatar" class="w-full h-full object-cover">
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-bold text-sm">${username}</span>
                    <span class="text-gray-500 text-sm">• ${time}</span>
                </div>
            </div>
            <button class="text-white hover:text-gray-400">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
        </div>

        <!-- Content -->
        <div class="rounded-sm overflow-hidden border border-gray-800 mb-3 bg-gray-900 flex items-center justify-center aspect-[4/5]">
             ${content}
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-4">
                <button class="hover:text-gray-400 transition-colors"><i class="fa-regular fa-heart text-2xl"></i></button>
                <button class="hover:text-gray-400 transition-colors"><i class="fa-regular fa-comment text-2xl"></i></button>
                <button class="hover:text-gray-400 transition-colors"><i class="fa-regular fa-paper-plane text-2xl"></i></button>
            </div>
            <button class="hover:text-gray-400 transition-colors"><i class="fa-regular fa-bookmark text-2xl"></i></button>
        </div>

        <!-- Likes -->
        <div class="font-bold text-sm mb-2">${likes} likes</div>

        <!-- Caption -->
        <div class="text-sm mb-2">
            <span class="font-bold mr-2">${username}</span>
            <span class="text-gray-100">${caption}</span>
        </div>

        <!-- Comments Link -->
        <div class="text-gray-500 text-sm cursor-pointer mb-2">View all ${commentCount} comments</div>

        <!-- Add Comment -->
        <div class="flex items-center justify-between">
            <input type="text" placeholder="Add a comment..." class="bg-transparent text-sm w-full focus:outline-none text-gray-300 placeholder-gray-500">
            <button class="text-gray-400 hover:text-white"><i class="fa-regular fa-face-smile"></i></button>
        </div>
    `;
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
            <div class="w-6 h-6 bg-gray-800 rounded-full"></div>
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
