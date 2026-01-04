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
import { showToast } from '../components/Toast.js';
import { abortController } from '../js/Router.js';

export default async function Register() {
    let csrfToken = await FetchCSRF();
    let renderedResult = document.createElement('div');
    renderedResult.className = 'container mx-auto flex justify-center items-center min-h-screen text-white py-5 px-4';

    const registerPage = document.createElement('div');
    registerPage.className = 'flex flex-col items-center justify-center w-full';
    registerPage.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center w-full" style="max-width: 350px;">

            <!-- Main Register Box -->
            <div class="p-4 w-full mb-3 flex flex-col items-center bg-black">
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

                    <button type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Sign up</button>
                </form>
            </div>

            <!-- Login Link Box -->
            <div class="p-3 w-full flex justify-center items-center bg-black">
                <p class="m-0 text-sm">Have an account? <a href="/signin"
                        class="no-underline text-blue-500 hover:text-blue-400 font-bold">Log
                        in</a></p>
            </div>

        </div>
    `;
    const confirmationPage = document.createElement('div');
    confirmationPage.className = 'container mx-auto flex justify-center items-center min-h-screen text-white py-5';
    confirmationPage.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center w-full" style="max-width: 350px;">
            <div class="p-4 w-full mb-3 flex flex-col items-center bg-black border border-gray-700 text-center">
                <img src="/public/Camagru.svg" class="object-cover mb-3" style="width: 12rem;" alt="Camagru Logo" />
                <h2 class="text-xl font-bold mb-3">Registration Successful!</h2>
                <p class="text-gray-400 mb-4">
                    Thank you for registering. Please check your email to confirm your account and activate it.
                </p>
                <a href="/signin" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full no-underline block text-center">
                    Go to Login
                </a>
            </div>
        </div>
    `;

    const loadingPage = document.createElement('div');
    loadingPage.className = 'container mx-auto flex justify-center items-center min-h-screen text-white py-5';
    loadingPage.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center w-full" style="max-width: 350px;">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    `;
    
    const form = registerPage.querySelector('#register-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        renderedResult.replaceChild(loadingPage, registerPage);
        try {
            const response = await fetch(`${window.env.APP_URL}index.php/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData,
                signal: abortController.signal
            });
            if (response.status === 201) {
                showToast("Account registered successfully", "success");
                renderedResult.replaceChild(confirmationPage, loadingPage);
            } else {
                const data = await response.json();
                showToast(data.error, "error");
                renderedResult.replaceChild(registerPage, loadingPage);
            }
        } catch (error) {
            showToast("An error occurred, Please try again later", "error");
            renderedResult.replaceChild(registerPage, loadingPage);
        } finally {
            csrfToken = await FetchCSRF();
        }
    };

    renderedResult.appendChild(registerPage);
    return renderedResult;
}
