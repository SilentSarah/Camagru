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

import { formatTimestamp, escapeHtml } from "../../js/Utils.js";

/**
 * Comment - Displays a single comment
 * @param {Object} props - Component props
 * @param {number|string} props.id - Comment ID
 * @param {Object} props.user - User object with username, avatar
 * @param {string} props.text - Comment text
 * @param {string} props.timestamp - Comment timestamp
 * @param {number} props.likes - Number of likes on the comment
 * @param {boolean} props.showReplyButton - Whether to show the reply button
 * @returns {string} HTML string
 */
export default function Comment({ id, user, text, timestamp, showReplyButton = false, canDelete = false, onDelete }) {
    const avatar = user?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;
    const username = user?.username || 'Anonymous';
    const userId = user?.id;
    const profileLink = userId ? `/profile?user_id=${userId}` : '#';
    
    return /*html*/`
        <div class="flex gap-3 comment-item group items-start" data-comment-id="${id}">
            <a href="${profileLink}" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                <img src="${avatar}" alt="${escapeHtml(username)}" class="w-full h-full object-cover">
            </a>
            <div class="flex-1">
                <p class="text-sm">
                    <a href="${profileLink}" class="font-semibold text-white mr-1 hover:underline">${escapeHtml(username)}</a>
                    <span class="text-white/90">${escapeHtml(text)}</span>
                </p>
                <div class="flex items-center gap-4 mt-1">
                    <span class="text-gray-400 text-xs">${formatTimestamp(timestamp)}</span>
                    ${showReplyButton ? `
                        <button class="text-gray-400 text-xs hover:text-white transition-colors comment-reply-btn">Reply</button>
                    ` : ''}
                </div>
            </div>
            ${canDelete ? `
                <button class="text-gray-500 hover:text-red-500 transition-colors comment-delete-btn opacity-0 group-hover:opacity-100 px-2" data-delete-comment-id="${id}" title="Delete comment">
                    <i class="fa-regular fa-trash-can text-xs"></i>
                </button>
            ` : ''}
        </div>
    `;
}
