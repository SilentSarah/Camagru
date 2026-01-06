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

import User from "../../js/User.js";

/**
 * PostDescription - Displays the post description with author info
 * @param {Object} props - Component props
 * @param {User} props.user - User object with username, avatar
 * @param {string} props.description - Post description text
 * @param {string} props.createdAt - Post creation date string
 * @returns {string} HTML string (empty string if no description)
 */
export default function PostDescription({ user, description, createdAt }) {
    if (!description) {
        return '';
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const avatar = user?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;
    const username = user?.username || 'Anonymous';
    const formattedDate = formatDate(createdAt);

    return /*html*/`
        <div class="flex gap-3 w-full" id="post-description">
            <a href="/profile?user_id=${user?.id}" class="hover:opacity-80 transition-opacity shrink-0">
                <img src="${avatar}" alt="${username}" class="size-8 rounded-full object-cover">
            </a>
            <div>
                <p class="text-sm">
                    <a href="/profile?user_id=${user?.id}" class="font-semibold text-white mr-1 hover:underline">${username}</a>
                    <span class="text-gray-300">${description}</span>
                </p>
                <p class="text-gray-400 text-xs mt-1">${formattedDate}</p>
            </div>
        </div>
    `;
}
