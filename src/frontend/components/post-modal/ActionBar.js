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
 * ActionBar - Displays the action buttons (like, comment, share, bookmark)
 * @param {Object} props - Component props
 * @param {number} props.likes - Number of likes
 * @param {boolean} props.isLiked - Whether the post is liked by current user
 * @returns {string} HTML string
 */
export default function ActionBar({ likes = 0, isLiked = false }) {
    const likeClass = isLiked ? 'text-red-500' : 'text-white hover:text-red-400';
    const heartIcon = isLiked ? 'fa-solid' : 'fa-regular';

    return /*html*/`
        <div id="action-bar">
            <!-- Action Buttons -->
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-4">
                    <button id="like-btn" class="hover:scale-110 transition-transform ${likeClass}">
                        <i class="${heartIcon} fa-heart text-2xl"></i>
                    </button>
                    <button id="comment-focus-btn" class="text-white hover:text-gray-300 transition-colors hover:scale-110">
                        <i class="fa-regular fa-comment text-2xl"></i>
                    </button>
                    <button id="share-btn" class="text-white hover:text-gray-300 transition-colors hover:scale-110">
                        <i class="fa-regular fa-paper-plane text-2xl"></i>
                    </button>
                </div>
                <button id="bookmark-btn" class="text-white hover:text-gray-300 transition-colors hover:scale-110">
                    <i class="fa-regular fa-bookmark text-2xl"></i>
                </button>
            </div>

            <!-- Likes Count -->
            <p class="font-semibold text-white text-sm mb-2">
                <span id="likes-count">${likes.toLocaleString()}</span> likes
            </p>
        </div>
    `;
}
