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
            <a href="/home" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-house text-xl w-6 text-center"></i>
                <span class="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Home</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-magnifying-glass text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Search</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-compass text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Explore</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-clapperboard text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Reels</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <div class="relative">
                    <i class="fa-brands fa-facebook-messenger text-xl w-6 text-center"></i>
                    <span class="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
                </div>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Messages</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-heart text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Notifications</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-regular fa-square-plus text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Create</span>
            </a>
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <div class="w-6 h-6 rounded-full bg-gray-600 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" class="w-full h-full object-cover">
                </div>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Profile</span>
            </a>
        </nav>

        <div class="p-2 mt-auto">
            <a href="#" class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap">
                <i class="fa-solid fa-bars text-xl w-6 text-center"></i>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">More</span>
            </a>
        </div>
    `;
    return div;
}
