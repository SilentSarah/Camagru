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
 * File Created: Sunday, 7th December 2025 6:41:58 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import getCsrfToken from '../js/Csrf.js';
import { showToast } from '../components/Toast.js';

export default async function PasswordRecovery() {
    const div = document.createElement('div');
    div.className = 'container mx-auto flex justify-center items-center h-screen text-white';
    
    div.innerHTML = /*html*/`
        <div class="flex items-center justify-center w-full gap-3">
            <!-- Left side - Image -->
            <div class="items-center justify-end hidden lg:block">
                <img src="/public/image.png" alt="recovery-image" class="max-w-full h-auto object-cover"
                    style="max-width: 500px;">
            </div>

            <!-- Right side - Recovery Form -->
            <div class="flex flex-col items-center justify-center py-5" style="width: 30%;">
                <img src="/public/Camagru.svg" class="object-cover mb-4" style="max-width: 200px; width: 75%;"
                    alt="Camagru Logo" />
                
                <form 
                    id="recovery-form" 
                    class="w-full px-3 sm:px-0" 
                    style="max-width: 320px;"
                    >
                    <div class="mb-3">
                        <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input type="email"
                            class="w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-0"
                            id="email" name="email" placeholder="Enter your email" required>
                    </div>
                    
                    <button
                        type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-3">
                        Send Recovery Link
                    </button>
                    
                    <div class="text-center mt-4">
                        <a href="/signin" class="text-sm text-blue-500 hover:text-blue-400 no-underline">Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = div.querySelector('#recovery-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('http://localhost:8000/index.php/password-recovery', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showToast('If an account exists with this email, a recovery link has been sent.', 'success');
                form.reset();
            } else {
                showToast(data.error || 'An error occurred. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Network error. Please try again later.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    };

    return div;
}
