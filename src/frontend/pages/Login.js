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

export default async function Login() {

    const div = document.createElement('div');
    div.className = 'container mx-auto flex justify-center items-center h-screen text-white';
    div.innerHTML = /*html*/`
        <div class="flex items-center justify-center w-full gap-3">
            <!-- Left side - Image -->
            <div class="items-center justify-end hidden lg:block">
                <img src="/public/image.png" alt="login-image" class="max-w-full h-auto object-cover"
                    style="max-width: 500px;">
            </div>

            <!-- Right side - Login Form -->
            <div class="flex flex-col items-center justify-center py-5" style="width: 30%;">
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
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-3">Login</button>
                </form>
                <p class="text-center text-sm w-full" style="max-width: 320px;">Don't have an account? <a href="/signup"
                        class="no-underline text-blue-500 hover:text-blue-400">Sign up</a></p>
            </div>
        </div>
    `;


    const form = div.querySelector('#login-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const response = await fetch('http://localhost:8000/index.php/login', {
            method: 'POST',
            credentials: 'include',
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
