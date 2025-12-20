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

import { formatTimestamp } from "../../js/Utils.js";

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
export default function Comment({ id, user, text, timestamp, likes = 0, showReplyButton = false }) {
    const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;
    const username = user?.username || 'Anonymous';


    return /*html*/`
        <div class="flex gap-3 comment-item" data-comment-id="${id}">
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src="${avatar}" alt="${username}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
                <p class="text-sm">
                    <span class="font-semibold text-white mr-1">${username}</span>
                    <span class="text-white/90">${text}</span>
                </p>
                <div class="flex items-center gap-4 mt-1">
                    <span class="text-gray-400 text-xs">${formatTimestamp(timestamp)}</span>
                    <span class="text-gray-300 font-bold text-xs">${likes} likes</span>
                    ${showReplyButton ? `
                        <button class="text-gray-400 text-xs hover:text-white transition-colors comment-reply-btn">Reply</button>
                    ` : ''}
                </div>
            </div>
            <button class="text-gray-300 hover:text-red-400 transition-colors comment-like-btn" data-comment-id="${id}">
                <i class="fa-regular fa-heart text-xs"></i>
            </button>
        </div>
    `;
}
