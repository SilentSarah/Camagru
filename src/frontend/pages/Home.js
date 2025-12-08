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
 * File Created: Monday, 24th November 2025 11:48:08 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import Post, { PostSkeleton } from '../components/Post.js';

export default function Home() {
    const div = document.createElement('div');
    div.className = 'flex justify-center w-full h-full bg-black text-white overflow-y-auto';
    div.innerHTML = /*html*/`
        <div class="w-full max-w-[470px] py-8 px-4">
            <!-- Feed -->
            <div class="flex flex-col gap-4 mx-auto" id="feed-container">
            </div>
        </div>
    `;

    const feedContainer = div.querySelector('#feed-container');
    for (let i = 0; i < 2; i++) feedContainer.appendChild(PostSkeleton());

    return div;
}
