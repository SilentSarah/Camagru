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
 * Generates share URLs for various social platforms
 * @param {Object} options - Share options
 * @param {number|string} options.postId - Post ID
 * @param {string} options.description - Post description for share text
 * @param {string} options.imagePath - Image path for Pinterest
 * @returns {Object} Object with share URLs for each platform
 */
export function generateShareLinks({ postId, description, imagePath }) {
    const currentUrl = encodeURIComponent(window.location.origin + `/post/${postId}`);
    const shareText = encodeURIComponent(description || 'Check out this photo!');
    
    return {
        twitter: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
        whatsapp: `https://wa.me/?text=${shareText}%20${currentUrl}`,
        telegram: `https://t.me/share/url?url=${currentUrl}&text=${shareText}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${currentUrl}&description=${shareText}&media=${encodeURIComponent(imagePath || '')}`
    };
}

/**
 * ShareDropdown - Displays the social media share dropdown
 * @param {Object} props - Component props
 * @param {Object} props.shareLinks - Object with share URLs for each platform
 * @param {boolean} props.hidden - Whether the dropdown is hidden initially
 * @returns {string} HTML string
 */
export default function ShareDropdown({ shareLinks, hidden = true }) {
    const hiddenClass = hidden ? 'hidden' : '';

    return /*html*/`
        <div id="share-dropdown" class="${hiddenClass} bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700 share-dropdown-animate">
            <p class="text-gray-300 text-xs uppercase tracking-wide mb-3 font-semibold">Share to</p>
            <div class="flex flex-wrap gap-2">
                <a href="${shareLinks.twitter}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center transition-all hover:scale-110" title="Share on X/Twitter">
                    <i class="fa-brands fa-x-twitter text-white"></i>
                </a>
                <a href="${shareLinks.facebook}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-110" title="Share on Facebook">
                    <i class="fa-brands fa-facebook-f text-white"></i>
                </a>
                <a href="${shareLinks.whatsapp}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-all hover:scale-110" title="Share on WhatsApp">
                    <i class="fa-brands fa-whatsapp text-white text-lg"></i>
                </a>
                <a href="${shareLinks.telegram}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 flex items-center justify-center transition-all hover:scale-110" title="Share on Telegram">
                    <i class="fa-brands fa-telegram text-white"></i>
                </a>
                <a href="${shareLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110" title="Share on LinkedIn">
                    <i class="fa-brands fa-linkedin-in text-white"></i>
                </a>
                <a href="${shareLinks.pinterest}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all hover:scale-110" title="Share on Pinterest">
                    <i class="fa-brands fa-pinterest-p text-white"></i>
                </a>
                <button id="copy-link-btn" class="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-400 flex items-center justify-center transition-all hover:scale-110" title="Copy Link">
                    <i class="fa-solid fa-link text-white"></i>
                </button>
            </div>
        </div>
    `;
}
