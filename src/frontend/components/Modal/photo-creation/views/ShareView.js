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
 * File Created: Sunday, 21st December 2025 5:19:53 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { user } from "../../../../js/Auth.js";



export function createShareView({ imageDataUrl }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col lg:flex-row h-full';
    
    container.innerHTML = /*html*/`
        <!-- Preview (Left) -->
        <div class="w-full lg:w-[65%] bg-black flex items-center justify-center">
            <img src="${imageDataUrl}" class="max-w-full max-h-full object-contain">
        </div>

        <!-- Details (Right) -->
        <div class="w-full lg:w-[35%] bg-insta border-l border-neutral-800 p-4 flex flex-col gap-4">
            <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-700">
                    ${
                        user.profile_picture_url ? 
                        /*html*/`<img src="${user.profile_picture_url}" class="w-full h-full object-cover rounded-full">` :
                        /*html*/`<div class="w-full h-full bg-gray-700 rounded-full text-white text-sm flex items-center justify-center">${user.username.charAt(0).toUpperCase()}</div>`
                    }
                    </div> 
                    <span class="font-semibold text-sm">${user.username}</span>
            </div>
            <textarea id="caption-input" class="w-full h-40 bg-transparent text-white resize-none outline-none text-sm placeholder-gray-500" placeholder="Write a caption..."></textarea>
        </div>
    `;

    container.getCaption = () => container.querySelector('#caption-input').value;

    return container;
}
