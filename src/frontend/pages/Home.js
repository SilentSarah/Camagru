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

import Post from '../components/Post.js';

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
    
    // We need to handle the fact that Post() might return a string (if not converted yet) or element (if converted).
    // Since I am converting them all in this turn, I will assume Post will be converted to return an element.
    // But to be safe and allow sequential execution without breakage:
    
    const posts = [
        {
            username: 'drpickle.phd',
            avatar: 'https://ui-avatars.com/api/?name=Dr+Pickle&background=random',
            time: '9h',
            content: `
                <div class="text-center">
                    <i class="fa-solid fa-image text-6xl text-gray-700 mb-4"></i>
                    <p class="text-gray-500">Post Content Placeholder</p>
                </div>
            `,
            likes: '11K',
            caption: 'not judging.. just saying 🙄',
            commentCount: '429'
        },
        {
            username: 'another_user',
            avatar: 'https://ui-avatars.com/api/?name=Another+User&background=random',
            time: '2h',
            content: `
                <div class="text-center">
                    <i class="fa-solid fa-video text-6xl text-gray-700 mb-4"></i>
                    <p class="text-gray-500">Video Content Placeholder</p>
                </div>
            `,
            likes: '532',
            caption: 'Beautiful day! ☀️',
            commentCount: '12'
        }
    ];

    posts.forEach(postData => {
        const postContent = Post(postData);
        if (typeof postContent === 'string') {
            feedContainer.insertAdjacentHTML('beforeend', postContent);
        } else {
            feedContainer.appendChild(postContent);
        }
    });

    return div;
}
