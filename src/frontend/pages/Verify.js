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
 * File Created: Tuesday, 2nd December 2025 12:13:46 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { showToast } from '../components/Toast.js';
import apiFetch from '../js/ApiClient.js';
import FetchCSRF from '../js/Csrf.js';
import { abortController } from '../js/Router.js';
import { getCookie } from '../js/Utils.js';

export default async function Verify() {
    const div = document.createElement('div');
    div.className = 'container mx-auto flex justify-center items-center min-h-screen text-white px-4';

    div.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center gap-4">
            <i class="fa-duotone fa-solid fa-spinner animate-spin text-white"></i>
            <h2 class="text-xl font-semibold">Activating your account...</h2>
        </div>
    `;

    const verifyAccount = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionToken = getCookie('session_token');
        const token = urlParams.get('token');
        if (!token) {
            showErrorMenu("Please insert the email address you registered with", true, "Verify Account", /*html*/`
                <svg class="mx-auto h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
            `);
            return;
        }
        const csrfToken = await FetchCSRF();
        const response = await apiFetch(`${window.env.APP_URL}index.php/verify-account?token=${token}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'X-CSRF-TOKEN': csrfToken
            },
            signal: abortController.signal
        });

        const result = await response.json();
        if (response.ok) {
            showSuccessMessage();
        } else if (response.status === 409) {
            showErrorMenu("Account already verified", false);
        } else {
            showErrorMenu(result.error, true, "Verification Failed", "");
        }

    };

    const showErrorMenu = (errorMessage, showBtn = true, customTitle = "Verification Failed", customIcon = "") => {
        div.innerHTML = /*html*/`
            <div class="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-700">
                <div class="mb-6">
                ${customIcon !== "" ? customIcon : /*html*/`
                    <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                `}
                    <h2 class="mt-4 text-2xl font-bold text-white">
                        ${customTitle}
                    </h2>
                    <p class="mt-2 text-gray-400">${errorMessage}</p>
                </div>
                
                ${showBtn ? /*html*/`
                <form id="request-code-form" class="w-full flex flex-col gap-3">
                    <input name="email" type="email" id="email-input" placeholder="Enter your email" required
                        class="w-full text-white bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button type="submit" id="request-new-code" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                        Request New Verification Code
                    </button>
                </form>
                ` : ""}
            </div>
        `;

        const form = div.querySelector('#request-code-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const requestBtn = form.querySelector('#request-new-code');
                const emailInput = form.querySelector('#email-input');
                const email = emailInput.value;

                try {
                    requestBtn.disabled = true;
                    requestBtn.innerHTML = /*html*/`
                        <span class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Sending...
                    `;

                    const formData = new FormData();
                    formData.append('email', email);

                    const response = await apiFetch(`${window.env.APP_URL}index.php/request-verification`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'X-CSRF-TOKEN': await FetchCSRF()
                        },
                        body: formData,
                        signal: abortController.signal
                    });

                    if (response.ok) {
                        showToast("Verification code sent!", "success");
                        emailInput.value = '';
                    }
                    else {
                        const res = await response.json();
                        showToast(res.error || "Unknown error", "error");
                    }
                } catch (e) {
                    showToast(e.error || "Unknown error", "error");
                } finally {
                    requestBtn.disabled = false;
                    requestBtn.textContent = "Request New Verification Code";
                }
            };
        }
    };

    const showSuccessMessage = () => {
        div.innerHTML = /*html*/`
           <div class="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-700">
                <div class="mb-6">
                    <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="mt-4 text-2xl font-bold text-white">Verification Successful</h2>
                    <p class="mt-2 text-gray-400">Your account has been successfully verified. You can now log in.</p>
                </div>
                
                <a href="/signin" id="request-new-code" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
                    Go to Login
                </a>
            </div>
        `;
    };


    verifyAccount();

    return div;
}
