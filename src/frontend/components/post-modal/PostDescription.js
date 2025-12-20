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
 * PostDescription - Displays the post description with author info
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with username, avatar
 * @param {string} props.description - Post description text
 * @param {string} props.createdAt - Post creation date string
 * @returns {string} HTML string (empty string if no description)
 */
export default function PostDescription({ user, description, createdAt }) {
    if (!description) {
        return '';
    }

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
        <div class="flex gap-3 w-full" id="post-description">
            <img src="${avatar}" alt="${username}" class="size-8 rounded-full">
            <div>
                <p class="text-sm">
                    <span class="font-semibold text-white mr-1">${username}</span>
                    <span class="text-gray-300">${description}</span>
                </p>
                <p class="text-gray-400 text-xs mt-1">${formattedDate}</p>
            </div>
        </div>
    `;
}
