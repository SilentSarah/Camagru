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
 * File Created: Monday, 24th November 2025 12:05:55 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { showToast } from '../components/Toast.js';
import apiFetch from '../js/ApiClient.js';
import FetchCSRF from '../js/Csrf.js';
import { abortController } from '../js/Router.js';
import { goTo } from '../js/Utils.js';

export default async function Login() {

    const div = document.createElement('div');
    div.className = 'container mx-auto flex justify-center items-center min-h-screen text-white px-4';
    div.innerHTML = /*html*/`
        <div class="flex items-center justify-center w-full gap-3">
            <!-- Left side - Image -->
            <div class="items-center justify-end hidden lg:block">
                <img src="/public/image.png" alt="login-image" class="max-w-full h-auto object-cover"
                    style="max-width: 500px;">
            </div>

            <!-- Right side - Login Form -->
            <div class="flex flex-col items-center justify-center py-5 w-full max-w-sm lg:w-[30%]">
                <img src="/public/Camagru.svg" class="object-cover mb-4" style="max-width: 200px; width: 75%;"
                    alt="Camagru Logo" />
                <form 
                    id="login-form" 
                    class="w-full px-3 sm:px-0" 
                    style="max-width: 320px;"
                    >
                    <div class="mb-3">
                        <input type="text"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-0"
                            id="username" name="username" placeholder="Username" required>
                    </div>
                    <div class="mb-3">
                        <input type="password"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-0"
                            id="password" name="password" placeholder="Password" required>
                    </div>
                    <button
                        type="submit"
                        id="login-btn"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-3">Login
                    </button>
                </form>
                <div class="mb-3 text-right">
                    <a href="/password-recovery" class="text-sm text-blue-500 hover:text-blue-400 no-underline">Forgot password?</a>
                </div>
                <p class="text-center text-sm w-full" style="max-width: 320px;">Don't have an account? <a href="/signup"
                        class="no-underline text-blue-500 hover:text-blue-400">Sign up</a>
                </p>
            </div>
        </div>
    `;


    const form = div.querySelector('#login-form');
    const submitBtn = div.querySelector('#login-btn');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        const formData = new FormData(form);
        try {
            const response = await apiFetch(`${window.env.APP_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': await FetchCSRF()
                },
                body: formData,
                signal: abortController.signal
            });
            const result = await response.json();
            if (response.status === 200) {
                showToast("Login successful", "success");
                goTo("/", 1);
            } else {
                if (result.code === "USER_NOT_VERIFIED") {
                    goTo("/verify", 1);
                } else {
                    showToast(result.error, "error");
                }
                submitBtn.disabled = false;
            }
        } catch (error) {
            showToast("An error occurred", "error");
            submitBtn.disabled = false;
        }
    };
    return div;
}
