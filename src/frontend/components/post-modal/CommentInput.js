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
 * CommentInput - Displays the comment input field with emoji and post buttons
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the input
 * @returns {string} HTML string
 */
export default function CommentInput({ placeholder = 'Add a comment...' }) {
    return /*html*/`
        <div id="comment-input-container" class="flex items-center gap-3 border-t border-gray-800 pt-3 relative">
            <div id="emoji-popover" class="hidden absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-50 w-64 h-48 overflow-y-auto">
                <div class="grid grid-cols-6 gap-2">
                    <!-- Emojis will be injected here -->
                </div>
            </div>
            <button id="emoji-btn" class="text-gray-300 hover:text-white transition-colors">
                <i class="fa-regular fa-face-smile text-xl"></i>
            </button>
            <input 
                type="text" 
                id="comment-input" 
                placeholder="${placeholder}" 
                class="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-400"
            >
            <button id="post-comment-btn" class="text-blue-500 font-semibold text-sm hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Post
            </button>
        </div>
    `;
}
