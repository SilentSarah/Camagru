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
export default function PostAuthorHeader({ user, createdAt, onOptionsClick }) {
    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;
    const username = user?.username || 'Anonymous';
    const formattedDate = formatDate(createdAt);

    return /*html*/`
        <div class="flex items-center gap-3 w-full mb-3" id="post-author-header">
            <img src="${avatar}" alt="${username}" class="size-8 rounded-full">
            <div class="flex-1">
                <span class="font-semibold text-white text-sm">${username}</span>
                <p class="text-gray-400 text-xs">${formattedDate}</p>
            </div>
            <button class="text-white hover:text-gray-300 transition-colors post-options-btn">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
        </div>
    `;
}
