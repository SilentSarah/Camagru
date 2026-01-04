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
 * File Created: Thursday, 12th December 2025
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

/**
 * PostAuthorHeader - Displays the post author information header
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with username, avatar
 * @param {string} props.createdAt - Post creation date string
 * @param {Function} props.onOptionsClick - Callback when options button is clicked
 * @returns {string} HTML string
 */
export default function PostAuthorHeader({ user, createdAt, isAuthor, onDelete }) {
    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const avatar = user?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;
    const username = user?.username || 'Anonymous';
    const formattedDate = formatDate(createdAt);

    const optionsButton = isAuthor ? `
        <div class="relative">
            <button class="text-white hover:text-gray-300 transition-colors post-options-btn" id="post-options-btn">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
            <div id="post-options-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                <button id="delete-post-btn" class="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700 transition-colors">
                    <i class="fa-solid fa-trash mr-2"></i> Delete Post
                </button>
            </div>
        </div>
    ` : '';

    return /*html*/`
        <div class="flex items-center gap-3 w-full mb-3" id="post-author-header">
            <a href="/profile?user_id=${user?.id}" class="hover:opacity-80 transition-opacity">
                <img src="${avatar}" alt="${username}" class="size-8 rounded-full object-cover">
            </a>
            <div class="flex-1">
                <a href="/profile?user_id=${user?.id}" class="font-semibold text-white text-sm hover:underline">${username}</a>
                <p class="text-gray-400 text-xs">${formattedDate}</p>
            </div>
            ${optionsButton}
        </div>
    `;
}
