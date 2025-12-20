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
 * File Created: Monday, 8th December 2025 5:37:17 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { user } from "../js/Auth.js";
import ProfileHeader from "../components/ProfileHeader.js";
import ProfileContent from "../components/ProfileContent.js";
import { showToast } from "../components/Toast.js";
import { getCookie } from "../js/Utils.js";

export default async function Profile() {
    let photos;
    const container = document.createElement('div');
    container.className = "h-screen w-screen flex flex-col justify-start items-center bg-black text-white p-4 md:p-8 font-sans";

    const session_token = getCookie('session_token');
    try {
        const res = await fetch(`http://localhost:8000/index.php/photos?user_id=${user.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${session_token}`
            }
        })
        if (!res.ok) {
            showToast("Failed to fetch photos, " + res.error, "error");
        }
        const obj = await res.json();
        photos = obj.data;
    } catch (error) {
        showToast("Failed to fetch photos", "error");
        console.log(error);
    } finally {

    }

    container.appendChild(ProfileHeader(user, photos, "mt-8"));
    container.appendChild(ProfileContent(photos));

    return container;
}
