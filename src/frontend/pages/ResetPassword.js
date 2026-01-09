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
 * File Created: Monday, 8th December 2025 11:40:47 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import FetchCSRF from '../js/Csrf.js';
import { showToast } from '../components/Toast.js';
import { goTo } from '../js/Utils.js';
import { abortController } from '../js/Router.js';
import apiFetch from '../js/ApiClient.js';

export default async function ResetPassword() {
    const div = document.createElement('div');
    div.className = 'container mx-auto flex justify-center items-center h-screen text-white';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showToast('Invalid or missing reset token.', 'error');
        setTimeout(() => goTo('/signin', 1), 2000);
        return div;
    }

    div.innerHTML = /*html*/`
        <div class="flex flex-col items-center justify-center">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-300">Verifying token...</p>
        </div>
    `;

    try {
        const response = await apiFetch(`${window.env.APP_URL}/reset-password?token=${token}`, {
            method: 'GET',
            credentials: 'include',
            signal: abortController.signal
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Invalid token');
        }

        renderForm(div, token);

    } catch (error) {
        showToast(error.message || 'Invalid or expired token.', 'error');
        setTimeout(() => goTo('/signin', 1), 3000);
    }

    return div;
}

function renderForm(container, token) {
    container.innerHTML = /*html*/`
        <div class="flex items-center justify-center w-full gap-3">
            <!-- Left side - Image -->
            <div class="items-center justify-end hidden lg:block">
                <img src="/public/image.png" alt="reset-password-image" class="max-w-full h-auto object-cover"
                    style="max-width: 500px;">
            </div>

            <!-- Right side - Reset Password Form -->
            <div class="flex flex-col items-center justify-center py-5" style="width: 30%;">
                <img src="/public/Camagru.svg" class="object-cover mb-4" style="max-width: 200px; width: 75%;"
                    alt="Camagru Logo" />
                
                <form 
                    id="reset-password-form" 
                    class="w-full px-3 sm:px-0" 
                    style="max-width: 320px;"
                    >
                    <div class="mb-3">
                        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                        <input type="password"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-0"
                            id="password" name="password" placeholder="Enter new password" required>
                    </div>

                    <div class="mb-3">
                        <label for="confirm_password" class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                        <input type="password"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-0"
                            id="confirm_password" name="confirm_password" placeholder="Confirm new password" required>
                    </div>
                    
                    <button
                        type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-3 flex justify-center items-center">
                        <span>Reset Password</span>
                    </button>
                    
                    <div class="text-center mt-4">
                        <a href="/signin" class="text-sm text-blue-500 hover:text-blue-400 no-underline">Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = container.querySelector('#reset-password-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');

        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = /*html*/`<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;

        try {
            const csrfToken = await FetchCSRF();
            const response = await apiFetch(`${window.env.APP_URL}/reset-password?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData,
                signal: abortController.signal
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Password reset successful. Please login.', 'success');
                goTo('/signin', 1);
            } else {
                showToast(data.error || 'An error occurred. Please try again.', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again later.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    };
}
