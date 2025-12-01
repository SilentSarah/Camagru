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
 * File Created: Monday, 24th November 2025 12:05:57 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import FetchCSRF from '../js/Csrf.js';

export default async function Register() {
    const csrfToken = await FetchCSRF();
    const div = document.createElement('div');
    div.className = 'container mx-auto flex justify-center items-center min-h-screen text-white py-5';
    div.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center w-full" style="max-width: 350px;">

            <!-- Main Register Box -->
            <div class="p-4 w-full mb-3 flex flex-col items-center bg-black border border-gray-700">
                <img src="/public/Camagru.svg" class="object-cover mb-3" style="width: 12rem;" alt="Camagru Logo" />

                <p class="text-center text-gray-400 font-bold mb-3">Sign up to see photos and videos from your friends.</p>

                <form id="register-form" class="w-full mt-3">
                    <div class="mb-2">
                        <input type="email"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-0"
                            name="email" placeholder="Email" required>
                    </div>
                    <div class="mb-2">
                        <input type="text"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-0"
                            name="fullname" placeholder="Full Name" required>
                    </div>
                    <div class="mb-2">
                        <input type="text"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-0"
                            name="username" placeholder="Username" required>
                    </div>
                    <div class="mb-3">
                        <input type="password"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-0"
                            name="password" placeholder="Password" required>
                    </div>

                    <p class="text-sm text-center text-gray-400 mb-3" style="font-size: 0.75rem;">
                        People who use our service may have uploaded your contact information to Camagru. <a href="#"
                            class="no-underline text-gray-200 hover:text-white">Learn More</a>
                    </p>
                    <p class="text-sm text-center text-gray-400 mb-3" style="font-size: 0.75rem;">
                        By signing up, you agree to our <a href="#"
                            class="no-underline text-gray-200 hover:text-white">Terms</a>, <a href="#"
                            class="no-underline text-gray-200 hover:text-white">Privacy Policy</a> and <a href="#"
                            class="no-underline text-gray-200 hover:text-white">Cookies Policy</a>.
                    </p>

                    <button type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Sign up</button>
                </form>
            </div>

            <!-- Login Link Box -->
            <div class="p-3 w-full flex justify-center items-center bg-black border border-gray-700">
                <p class="m-0 text-sm">Have an account? <a href="/signin"
                        class="no-underline text-blue-500 hover:text-blue-400 font-bold">Log
                        in</a></p>
            </div>

        </div>
    `;

    const form = div.querySelector('#register-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const response = await fetch('http://localhost:8000/index.php/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
            body: formData
        });
        const result = await response.json();
        if (response.status === 200) {
            alert("success")
        } else {
            alert(result.error);
        }
    };

    return div;
}
